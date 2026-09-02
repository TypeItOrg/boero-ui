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
        instrumentSelection: {
          studyPlanSpaceInstrumentIds: {},
        },
      },
    });
    expect(revalidatePathMock).toHaveBeenCalledWith("/enrollment-applications/019183ab-45bc-7000-8000-000000000001/study-plan-spaces");
  });

  it("requires at least one selected study plan space", async () => {
    const formData = new FormData();
    formData.set("currentData", JSON.stringify({ personalData: { firstName: "Ana" } }));

    await expect(saveEnrollmentApplicationStudyPlanSpacesAction("019183ab-45bc-7000-8000-000000000001", {}, formData)).resolves.toEqual({
      fieldErrors: {
        studyPlanSpaceIds: "Seleccioná al menos un espacio academico.",
      },
    });
  });

  it("persists instrument selections for the selected spaces", async () => {
    apiFetchMock.mockResolvedValue(new Response(null, { status: 200 }));

    const formData = new FormData();
    formData.set("currentData", JSON.stringify({ personalData: { firstName: "Ana" } }));
    formData.append("studyPlanSpaceIds", "019183ab-45bc-7000-8000-000000000101");
    formData.append("requiredStudyPlanSpaceIds", "019183ab-45bc-7000-8000-000000000101");
    formData.append("instrumentSelectionStudyPlanSpaceId", "019183ab-45bc-7000-8000-000000000101");
    formData.append("instrumentSelectionInstrumentId", "019183ab-45bc-7000-8000-000000000201");

    const result = await saveEnrollmentApplicationStudyPlanSpacesAction("019183ab-45bc-7000-8000-000000000001", {}, formData);

    expect(result).toEqual({ success: true });
    expect(JSON.parse(String(apiFetchMock.mock.calls[0]?.[1]?.body))).toEqual({
      data: {
        personalData: { firstName: "Ana" },
        academicSpaceSelection: { studyPlanSpaceIds: ["019183ab-45bc-7000-8000-000000000101"] },
        instrumentSelection: {
          studyPlanSpaceInstrumentIds: {
            "019183ab-45bc-7000-8000-000000000101": "019183ab-45bc-7000-8000-000000000201",
          },
        },
      },
    });
  });

  it("requires an instrument selection for every selected space in the current step", async () => {
    const formData = new FormData();
    formData.set("currentData", JSON.stringify({ personalData: { firstName: "Ana" } }));
    formData.append("studyPlanSpaceIds", "019183ab-45bc-7000-8000-000000000101");
    formData.append("requiredStudyPlanSpaceIds", "019183ab-45bc-7000-8000-000000000101");

    await expect(saveEnrollmentApplicationStudyPlanSpacesAction("019183ab-45bc-7000-8000-000000000001", {}, formData)).resolves.toEqual({
      fieldErrors: {
        studyPlanSpaceInstrumentIds: "Seleccioná un instrumento para cada espacio que lo requiera.",
      },
    });
  });

  it("returns a field error when an instrument id is invalid", async () => {
    const formData = new FormData();
    formData.set("currentData", JSON.stringify({ personalData: {} }));
    formData.append("studyPlanSpaceIds", "019183ab-45bc-7000-8000-000000000101");
    formData.append("requiredStudyPlanSpaceIds", "019183ab-45bc-7000-8000-000000000101");
    formData.append("instrumentSelectionStudyPlanSpaceId", "019183ab-45bc-7000-8000-000000000101");
    formData.append("instrumentSelectionInstrumentId", "invalid-id");

    await expect(saveEnrollmentApplicationStudyPlanSpacesAction("019183ab-45bc-7000-8000-000000000001", {}, formData)).resolves.toEqual({
      fieldErrors: { studyPlanSpaceInstrumentIds: "Seleccion invalida de instrumento." },
    });
  });

  it("maps backend field errors for instrument selections", async () => {
    apiFetchMock.mockResolvedValue(
      new Response(
        JSON.stringify({
          message: "Uno o mas instrumentos seleccionados no estan habilitados para inscripcion.",
          fieldErrors: {
            "data.instrumentSelection.studyPlanSpaceInstrumentIds":
              "Uno o mas instrumentos seleccionados no estan habilitados para inscripcion.",
          },
        }),
        { status: 400, headers: { "content-type": "application/json" } },
      ),
    );

    const formData = new FormData();
    formData.set("currentData", JSON.stringify({ personalData: {} }));
    formData.append("studyPlanSpaceIds", "019183ab-45bc-7000-8000-000000000101");
    formData.append("requiredStudyPlanSpaceIds", "019183ab-45bc-7000-8000-000000000101");
    formData.append("instrumentSelectionStudyPlanSpaceId", "019183ab-45bc-7000-8000-000000000101");
    formData.append("instrumentSelectionInstrumentId", "019183ab-45bc-7000-8000-000000000201");

    await expect(saveEnrollmentApplicationStudyPlanSpacesAction("019183ab-45bc-7000-8000-000000000001", {}, formData)).resolves.toEqual({
      error: "Uno o mas instrumentos seleccionados no estan habilitados para inscripcion.",
      fieldErrors: {
        studyPlanSpaceInstrumentIds: "Uno o mas instrumentos seleccionados no estan habilitados para inscripcion.",
      },
    });
  });
});
