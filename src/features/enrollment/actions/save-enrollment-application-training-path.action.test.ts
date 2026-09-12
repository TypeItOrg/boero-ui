jest.mock("next/cache", () => ({
  revalidatePath: jest.fn(),
}));

jest.mock("@features/institutional-auth/services/institutional-api-fetch.service", () => ({
  institutionalApiFetch: jest.fn(),
}));

jest.mock("@features/institutional-auth/services/get-institutional-user.service", () => ({
  requireInstitutionalUser: jest.fn(),
}));

import { revalidatePath } from "next/cache";

import { saveEnrollmentApplicationTrainingPathAction } from "@features/enrollment/actions/save-enrollment-application-training-path.action";
import { institutionalApiFetch } from "@features/institutional-auth/services/institutional-api-fetch.service";
import { requireInstitutionalUser } from "@features/institutional-auth/services/get-institutional-user.service";

describe("saveEnrollmentApplicationTrainingPathAction", () => {
  const apiFetchMock = jest.mocked(institutionalApiFetch);
  const requireInstitutionalUserMock = jest.mocked(requireInstitutionalUser);
  const revalidatePathMock = jest.mocked(revalidatePath);

  beforeEach(() => {
    apiFetchMock.mockReset();
    requireInstitutionalUserMock.mockReset();
    revalidatePathMock.mockReset();
    requireInstitutionalUserMock.mockResolvedValue({
      userId: "user-1",
      personId: "person-1",
      name: "Ana",
      lastName: "Garcia",
      documentNumber: "12345678",
      institutionId: "institution-1",
      permissions: [],
      roles: ["Postulante"],
    });
  });

  it("returns a field error when no training path is selected", async () => {
    const formData = new FormData();
    formData.set("currentData", JSON.stringify({ personalData: {} }));
    formData.set("trainingPathId", "");

    await expect(
      saveEnrollmentApplicationTrainingPathAction(
        "019183ab-45bc-7000-8000-000000000001",
        {},
        formData,
      ),
    ).resolves.toEqual({
      fieldErrors: { trainingPathId: "Seleccioná un trayecto formativo." },
    });
  });

  it("replaces the draft payload with the selected training path", async () => {
    apiFetchMock.mockResolvedValue(new Response(null, { status: 200 }));

    const formData = new FormData();
    formData.set("currentData", JSON.stringify({ personalData: { firstName: "Ana" } }));
    formData.set("trainingPathId", "019183ab-45bc-7000-8000-000000000099");

    const result = await saveEnrollmentApplicationTrainingPathAction(
      "019183ab-45bc-7000-8000-000000000001",
      {},
      formData,
    );

    expect(result).toEqual({ success: true });
    const [path, request] = apiFetchMock.mock.calls[0] ?? [];
    expect(path).toBe("/api/v1/enrollment-applications/019183ab-45bc-7000-8000-000000000001/draft");
    expect(JSON.parse(String(request?.body))).toEqual({
      data: {
        personalData: { firstName: "Ana" },
        careerSelection: { trainingPathId: "019183ab-45bc-7000-8000-000000000099" },
      },
    });
    expect(revalidatePathMock).toHaveBeenCalledWith(
      "/enrollment-applications/019183ab-45bc-7000-8000-000000000001/training-path",
    );
  });
});
