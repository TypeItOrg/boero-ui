jest.mock("next/cache", () => ({ revalidatePath: jest.fn() }));
jest.mock("next/navigation", () => ({
  redirect: jest.fn(() => {
    throw new Error("NEXT_REDIRECT");
  }),
}));
jest.mock("@features/institutional-auth/services/institutional-api-fetch.service", () => ({ institutionalApiFetch: jest.fn() }));
jest.mock("@features/platform-auth/services/platform-api-fetch.service", () => ({ platformApiFetch: jest.fn() }));
jest.mock("@features/institutional-auth/services/get-institutional-user.service", () => ({
  requireInstitutionalUser: jest.fn().mockResolvedValue({ institutionId: "00000000-0000-4000-8000-000000000001" }),
}));
jest.mock("@features/platform-auth/services/get-platform-account.service", () => ({ requirePlatformAccount: jest.fn() }));

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { INVALID_ACTION_ARGUMENTS } from "@common/utils/action-argument.util";
import { institutionalApiFetch } from "@features/institutional-auth/services/institutional-api-fetch.service";
import { platformApiFetch } from "@features/platform-auth/services/platform-api-fetch.service";
import {
  createManualCourseEnrollmentAction,
  rejectApplicationCourseAction,
  withdrawCourseEnrollmentAction,
  updateCourseAcademicStatusAction,
} from "@features/course-enrollments/actions/course-enrollment.actions";
import { rejectPlatformApplicationCourseAction } from "@features/course-enrollments/actions/platform-course-enrollment.actions";

const ID = "00000000-0000-4000-8000-000000000001";

beforeEach(() => {
  jest.clearAllMocks();
  jest.mocked(institutionalApiFetch).mockResolvedValue(new Response(null, { status: 201 }));
});

it.each([null, undefined, 123, {}, [], "", "   "])("rejects invalid remote reasons without throwing: %p", async (value) => {
  const reason = value as unknown as string;
  await expect(rejectApplicationCourseAction(ID, ID, 0, reason)).resolves.toEqual({ error: INVALID_ACTION_ARGUMENTS });
  await expect(withdrawCourseEnrollmentAction(ID, "VOLUNTARY", reason, 0)).resolves.toEqual({ error: INVALID_ACTION_ARGUMENTS });
  await expect(updateCourseAcademicStatusAction(ID, "PASSED", reason, 0)).resolves.toEqual({ error: INVALID_ACTION_ARGUMENTS });
  await expect(rejectPlatformApplicationCourseAction(ID, ID, ID, 0, reason)).resolves.toEqual({ error: INVALID_ACTION_ARGUMENTS });
  expect(institutionalApiFetch).not.toHaveBeenCalled();
  expect(platformApiFetch).not.toHaveBeenCalled();
});

it("continues sending valid reasons", async () => {
  await expect(withdrawCourseEnrollmentAction(ID, "VOLUNTARY", "Baja solicitada", 0)).resolves.toEqual({});
  expect(institutionalApiFetch).toHaveBeenCalledWith(
    expect.stringContaining("/withdraw"),
    expect.objectContaining({
      body: JSON.stringify({ type: "VOLUNTARY", reason: "Baja solicitada", expectedVersion: 0 }),
    }),
  );
});

function manualForm(returnTo: string): FormData {
  const data = new FormData();
  data.set("studentId", ID);
  data.set("courseId", ID);
  data.set("courseClassId", ID);
  data.set("assignments", JSON.stringify([{ classScheduleId: ID, individualSlotId: null }]));
  data.set("returnTo", returnTo);
  return data;
}

it("redirects a successful manual enrollment to the original filtered page", async () => {
  const origin = "/course-enrollments?page=2&size=30&status=ENROLLED&academicStatus=IN_PROGRESS";
  await expect(createManualCourseEnrollmentAction(manualForm(origin))).rejects.toThrow("NEXT_REDIRECT");
  expect(revalidatePath).toHaveBeenCalledWith("/course-enrollments");
  expect(redirect).toHaveBeenCalledWith(origin);
});

it.each(["https://evil.example", "//evil.example", "/\\evil.example"])("rejects external return destinations: %s", async (origin) => {
  await expect(createManualCourseEnrollmentAction(manualForm(origin))).rejects.toThrow("NEXT_REDIRECT");
  expect(redirect).toHaveBeenCalledWith("/course-enrollments");
});

it("keeps the form open after a backend failure", async () => {
  jest.mocked(institutionalApiFetch).mockResolvedValue(new Response(JSON.stringify({ message: "Sin cupos" }), { status: 400 }));
  await expect(createManualCourseEnrollmentAction(manualForm("/course-enrollments?page=2"))).resolves.toEqual({ error: "Sin cupos" });
  expect(redirect).not.toHaveBeenCalled();
});
