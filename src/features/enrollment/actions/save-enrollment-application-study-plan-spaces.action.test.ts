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

import { saveEnrollmentApplicationStudyPlanSpacesAction } from "@features/enrollment/actions/save-enrollment-application-study-plan-spaces.action";
import { institutionalApiFetch } from "@features/institutional-auth/services/institutional-api-fetch.service";
import { requireInstitutionalUser } from "@features/institutional-auth/services/get-institutional-user.service";

describe("saveEnrollmentApplicationStudyPlanSpacesAction", () => {
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

  it("returns a field error when a study plan space id is invalid", async () => {
    const formData = new FormData();
    formData.set("currentData", JSON.stringify({ personalData: {} }));
    formData.append("studyPlanSpaceIds", "invalid-id");

    await expect(saveEnrollmentApplicationStudyPlanSpacesAction("019183ab-45bc-7000-8000-000000000001", {}, formData)).resolves.toEqual({
      fieldErrors: { studyPlanSpaceIds: "Seleccion invalida de espacios academicos." },
    });
  });

  it("replaces the draft payload with the selected study plan spaces", async () => {
    apiFetchMock.mockResolvedValue(new Response(null, { status: 200 }));

    const formData = new FormData();
    formData.set("currentData", JSON.stringify({ personalData: { firstName: "Ana" }, careerSelection: { trainingPathId: "path-1" } }));
    formData.append("studyPlanSpaceIds", "019183ab-45bc-7000-8000-000000000101");
    formData.append("studyPlanSpaceIds", "019183ab-45bc-7000-8000-000000000102");

    const result = await saveEnrollmentApplicationStudyPlanSpacesAction("019183ab-45bc-7000-8000-000000000001", {}, formData);

    expect(result).toEqual({ success: true });
    const [path, request] = apiFetchMock.mock.calls[0] ?? [];
    expect(path).toBe("/api/v1/enrollment-applications/019183ab-45bc-7000-8000-000000000001/draft");
    expect(JSON.parse(String(request?.body))).toEqual({
      data: {
        personalData: { firstName: "Ana" },
        careerSelection: { trainingPathId: "path-1" },
        academicSpaceSelection: {
          studyPlanSpaceIds: ["019183ab-45bc-7000-8000-000000000101", "019183ab-45bc-7000-8000-000000000102"],
        },
      },
    });
    expect(revalidatePathMock).toHaveBeenCalledWith("/enrollment-applications/019183ab-45bc-7000-8000-000000000001/study-plan-spaces");
  });

  it("allows saving an empty selection", async () => {
    apiFetchMock.mockResolvedValue(new Response(null, { status: 200 }));

    const formData = new FormData();
    formData.set("currentData", JSON.stringify({ personalData: { firstName: "Ana" } }));

    const result = await saveEnrollmentApplicationStudyPlanSpacesAction("019183ab-45bc-7000-8000-000000000001", {}, formData);

    expect(result).toEqual({ success: true });
    expect(JSON.parse(String(apiFetchMock.mock.calls[0]?.[1]?.body))).toEqual({
      data: {
        personalData: { firstName: "Ana" },
        academicSpaceSelection: { studyPlanSpaceIds: [] },
      },
    });
  });
});
