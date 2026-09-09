jest.mock("next/cache", () => ({
  revalidatePath: jest.fn(),
}));

jest.mock("next/navigation", () => ({
  redirect: jest.fn(),
}));

jest.mock("@features/institutional-auth/services/institutional-api-fetch.service", () => ({
  institutionalApiFetch: jest.fn(),
}));

jest.mock("@features/institutional-auth/services/get-institutional-user.service", () => ({
  requireInstitutionalUser: jest.fn(),
}));

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createEnrollmentApplicationAction } from "@features/enrollment/actions/create-enrollment-application.action";
import { institutionalApiFetch } from "@features/institutional-auth/services/institutional-api-fetch.service";
import { requireInstitutionalUser } from "@features/institutional-auth/services/get-institutional-user.service";

describe("createEnrollmentApplicationAction", () => {
  const apiFetchMock = jest.mocked(institutionalApiFetch);
  const requireInstitutionalUserMock = jest.mocked(requireInstitutionalUser);
  const revalidatePathMock = jest.mocked(revalidatePath);
  const redirectMock = jest.mocked(redirect);

  beforeEach(() => {
    apiFetchMock.mockReset();
    requireInstitutionalUserMock.mockReset();
    revalidatePathMock.mockReset();
    redirectMock.mockReset();
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

  it("returns field errors when required selections are missing", async () => {
    const formData = new FormData();
    formData.set("studyPlanId", "");
    formData.set("academicYearId", "");

    await expect(createEnrollmentApplicationAction("/enrollment-applications", {}, formData)).resolves.toEqual({
      fieldErrors: {
        academicYearId: "Seleccioná un ciclo lectivo.",
        studyPlanId: "Seleccioná un plan de estudio.",
      },
    });
  });

  it("creates the application and redirects to the training path step", async () => {
    apiFetchMock.mockResolvedValue(
      new Response(
        JSON.stringify({
          applicationId: "019183ab-45bc-7000-8000-000000000001",
        }),
        { status: 201, headers: { "Content-Type": "application/json" } },
      ),
    );

    const formData = new FormData();
    formData.set("studyPlanId", "019183ab-45bc-7000-8000-000000000010");
    formData.set("academicYearId", "019183ab-45bc-7000-8000-000000000020");

    await createEnrollmentApplicationAction("/enrollment-applications", {}, formData);

    const [path, request] = apiFetchMock.mock.calls[0] ?? [];
    expect(path).toBe("/api/v1/enrollment-applications");
    expect(request?.method).toBe("POST");
    expect(JSON.parse(String(request?.body))).toEqual({
      studyPlanId: "019183ab-45bc-7000-8000-000000000010",
      academicYearId: "019183ab-45bc-7000-8000-000000000020",
    });
    expect(revalidatePathMock).toHaveBeenCalledWith("/enrollment-applications");
    expect(redirectMock).toHaveBeenCalledWith(
      "/enrollment-applications/019183ab-45bc-7000-8000-000000000001/training-path?returnTo=%2Fenrollment-applications",
    );
  });
});
