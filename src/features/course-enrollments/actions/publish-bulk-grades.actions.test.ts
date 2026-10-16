import { revalidatePath } from "next/cache";

import { INVALID_ACTION_ARGUMENTS } from "@common/utils/action-argument.util";

import { publishBulkInstitutionalGradesAction } from "@features/course-enrollments/actions/publish-bulk-grades.actions";
import { institutionalApiFetch } from "@features/institutional-auth/services/institutional-api-fetch.service";

jest.mock("next/cache", () => ({ revalidatePath: jest.fn() }));
jest.mock("@features/institutional-auth/services/institutional-api-fetch.service", () => ({
  institutionalApiFetch: jest.fn(),
}));
jest.mock("@features/institutional-auth/services/get-institutional-user.service", () => ({
  requireInstitutionalUser: jest.fn().mockResolvedValue({ institutionId: "00000000-0000-4000-8000-0000000000ff" }),
}));

function classId(index: number): string {
  return `00000000-0000-4000-8000-${String(index).padStart(12, "0")}`;
}

function publishBody(body: Record<string, unknown>): Response {
  return new Response(JSON.stringify(body), { status: 200, headers: { "Content-Type": "application/json" } });
}

beforeEach(() => {
  jest.clearAllMocks();
  jest.mocked(institutionalApiFetch).mockReset();
});

it.each([[], "not-an-array", [null], ["not-a-uuid"], [123], [classId(1), "not-a-uuid"]])(
  "rejects invalid selections without calling the API: %p",
  async (value) => {
    await expect(publishBulkInstitutionalGradesAction(value as unknown as string[])).resolves.toEqual({
      error: INVALID_ACTION_ARGUMENTS,
    });

    expect(institutionalApiFetch).not.toHaveBeenCalled();
  },
);

it("publishes exactly the batch limit and rejects larger selections", async () => {
  jest
    .mocked(institutionalApiFetch)
    .mockImplementation(() => Promise.resolve(publishBody({ publishedGrades: 1, deletedGrades: 0, affectedStudents: 1 })));

  const limit = Array.from({ length: 20 }, (_, index) => classId(index + 1));

  const result = await publishBulkInstitutionalGradesAction(limit);

  expect(result.error).toBeUndefined();
  expect(result.publishedClasses).toBe(20);
  expect(result.results).toHaveLength(20);
  expect(institutionalApiFetch).toHaveBeenCalledTimes(20);

  jest.mocked(institutionalApiFetch).mockClear();

  await expect(publishBulkInstitutionalGradesAction([...limit, classId(21)])).resolves.toEqual({
    error: "No se pueden publicar más de 20 clases por lote.",
  });

  expect(institutionalApiFetch).not.toHaveBeenCalled();
});

it("deduplicates repeated class ids before publishing", async () => {
  jest
    .mocked(institutionalApiFetch)
    .mockImplementation(() => Promise.resolve(publishBody({ publishedGrades: 0, deletedGrades: 0, affectedStudents: 0 })));

  const result = await publishBulkInstitutionalGradesAction([classId(1), classId(1), classId(2)]);

  expect(institutionalApiFetch).toHaveBeenCalledTimes(2);
  expect(result.results?.map((entry) => entry.classId)).toEqual([classId(1), classId(2)]);
  expect(result.publishedClasses).toBe(2);
});

it("publishes each class against the institutional endpoint and revalidates", async () => {
  jest.mocked(institutionalApiFetch).mockResolvedValue(publishBody({ publishedGrades: 2, deletedGrades: 1, affectedStudents: 3 }));

  const result = await publishBulkInstitutionalGradesAction([classId(1)]);

  expect(institutionalApiFetch).toHaveBeenCalledWith(
    `/api/v1/institutions/00000000-0000-4000-8000-0000000000ff/course-classes/${classId(1)}/grades/publish`,
    { method: "POST" },
  );
  expect(result).toEqual({
    publishedClasses: 1,
    publishedGrades: 2,
    deletedGrades: 1,
    affectedStudents: 3,
    results: [{ classId: classId(1), status: "published", publishedGrades: 2, deletedGrades: 1, affectedStudents: 3 }],
  });
  expect(revalidatePath).toHaveBeenCalledWith("/course-enrollments");
  expect(revalidatePath).toHaveBeenCalledWith("/my-course-enrollments");
});

it("keeps processing the remaining classes after a network failure and classifies it as uncertain", async () => {
  jest
    .mocked(institutionalApiFetch)
    .mockResolvedValueOnce(publishBody({ publishedGrades: 2, deletedGrades: 0, affectedStudents: 2 }))
    .mockRejectedValueOnce(new Error("timeout"))
    .mockResolvedValueOnce(publishBody({ publishedGrades: 1, deletedGrades: 1, affectedStudents: 1 }));

  const result = await publishBulkInstitutionalGradesAction([classId(1), classId(2), classId(3)]);

  expect(result.publishedClasses).toBe(2);
  expect(result.uncertainClasses).toBe(1);
  expect(result.uncertainClassIds).toEqual([classId(2)]);
  expect(result.results).toEqual([
    { classId: classId(1), status: "published", publishedGrades: 2, deletedGrades: 0, affectedStudents: 2 },
    {
      classId: classId(2),
      status: "uncertain",
      error: "No se pudo confirmar la publicación. Verificá el estado antes de reintentar.",
    },
    { classId: classId(3), status: "published", publishedGrades: 1, deletedGrades: 1, affectedStudents: 1 },
  ]);
});

it("classifies an unreadable response as uncertain without claiming success", async () => {
  jest.mocked(institutionalApiFetch).mockResolvedValue(new Response("not-json", { status: 200 }));

  const result = await publishBulkInstitutionalGradesAction([classId(1)]);

  expect(result.publishedClasses).toBeUndefined();
  expect(result.uncertainClasses).toBe(1);
  expect(result.error).toBe("No se pudo confirmar la publicación. Verificá el estado antes de reintentar.");
  expect(result.results).toEqual([
    {
      classId: classId(1),
      status: "uncertain",
      error: "Respuesta inesperada. Verificá el estado antes de reintentar.",
    },
  ]);
});

it("reports confirmed failures without publishing when every class fails", async () => {
  jest.mocked(institutionalApiFetch).mockResolvedValue(new Response(null, { status: 500 }));

  const result = await publishBulkInstitutionalGradesAction([classId(1), classId(2)]);

  expect(result).toEqual({
    error: "No se pudieron publicar las notas.",
    failedClasses: 2,
    results: [
      { classId: classId(1), status: "failed", error: "La clase no se pudo publicar (HTTP 500)." },
      { classId: classId(2), status: "failed", error: "La clase no se pudo publicar (HTTP 500)." },
    ],
  });
});
