jest.mock("next/cache", () => ({ revalidatePath: jest.fn() }));
jest.mock("next/navigation", () => ({ redirect: jest.fn() }));
jest.mock("@features/academic/services/academic-api-fetch.service", () => ({ academicApiFetch: jest.fn() }));
jest.mock("@features/institutional-auth/services/get-institutional-user.service", () => ({
  requireInstitutionalUser: jest.fn(),
}));
jest.mock("@features/platform-auth/services/get-platform-account.service", () => ({
  requirePlatformAccount: jest.fn(),
}));

import {
  deleteAcademicResourceAction,
  saveAcademicResourceAction,
  updateAcademicStatusAction,
} from "@features/academic/actions/academic-resource.action";
import { academicApiFetch } from "@features/academic/services/academic-api-fetch.service";
import { AcademicResource } from "@features/academic/types/academic-resource.types";
import {
  INSTITUTIONAL_PERMISSION,
  type InstitutionalPermission,
} from "@features/institutional-auth/types/institutional-permission.types";
import { requireInstitutionalUser } from "@features/institutional-auth/services/get-institutional-user.service";
import { AcademicScope } from "@features/academic/utils/academic-scope.util";
import { requirePlatformAccount } from "@features/platform-auth/services/get-platform-account.service";

const INSTITUTION_ID = "05b84ac4-66aa-409f-a813-012d15b8cb9b";
const RESOURCE_ID = "2d9ec931-453c-4778-86a9-dc40a06d0247";

describe("academic resource actions", () => {
  it("rejects a forged context before authentication or API access", async () => {
    const result = await saveAcademicResourceAction(
      AcademicScope.ADMIN,
      "not-an-institution-id",
      AcademicResource.TRAINING_PATH,
      undefined,
      undefined,
      undefined,
      {},
      new FormData(),
    );

    expect(result).toEqual({ error: "La solicitud académica no tiene un formato válido." });
    expect(requirePlatformAccount).not.toHaveBeenCalled();
    expect(academicApiFetch).not.toHaveBeenCalled();
  });

  it("uses the validated contextual parent when creating a study plan", async () => {
    const institutionId = "05b84ac4-66aa-409f-a813-012d15b8cb9b";
    const contextualTrainingPathId = "2d9ec931-453c-4778-86a9-dc40a06d0247";
    const forgedTrainingPathId = "a755b72b-04b7-4255-8bca-243f391155cc";

    jest.mocked(requireInstitutionalUser).mockResolvedValue({
      userId: "user-id",
      personId: "person-id",
      name: "Ana",
      lastName: "García",
      documentNumber: "12345678",
      institutionId,
      roles: [],
      permissions: [INSTITUTIONAL_PERMISSION.STUDY_PLAN_CREATE],
    });
    jest.mocked(academicApiFetch).mockResolvedValue(new Response(null, { status: 201 }));

    const formData = new FormData();
    formData.set("name", "Plan 2027");
    formData.set("trainingPathId", forgedTrainingPathId);
    formData.set("effectiveFrom", "");
    formData.set("effectiveTo", "");

    await saveAcademicResourceAction(
      AcademicScope.INSTITUTIONAL,
      institutionId,
      AcademicResource.STUDY_PLAN,
      undefined,
      contextualTrainingPathId,
      "/training-paths/" + contextualTrainingPathId,
      {},
      formData,
    );

    expect(academicApiFetch).toHaveBeenCalledWith(
      AcademicScope.INSTITUTIONAL,
      `/api/v1/institutions/${institutionId}/training-paths/${contextualTrainingPathId}/study-plans`,
      expect.objectContaining({
        body: JSON.stringify({ name: "Plan 2027", effectiveFrom: null, effectiveTo: null }),
      }),
    );
  });

  it("updates a training-path status separately from its editable data", async () => {
    jest.mocked(requireInstitutionalUser).mockResolvedValue({
      userId: "user-id",
      personId: "person-id",
      name: "Ana",
      lastName: "García",
      documentNumber: "12345678",
      institutionId: INSTITUTION_ID,
      roles: [],
      permissions: [
        INSTITUTIONAL_PERMISSION.TRAINING_PATH_UPDATE,
        INSTITUTIONAL_PERMISSION.TRAINING_PATH_STATUS_UPDATE,
      ],
    });
    jest.mocked(academicApiFetch).mockResolvedValue(new Response(null, { status: 200 }));

    const formData = new FormData();
    formData.set("name", "CAVI");
    formData.set("description", "Formación docente.");
    formData.set("active", "false");
    formData.set("initialActive", "true");

    await saveAcademicResourceAction(
      AcademicScope.INSTITUTIONAL,
      INSTITUTION_ID,
      AcademicResource.TRAINING_PATH,
      RESOURCE_ID,
      undefined,
      "/training-paths",
      {},
      formData,
    );

    expect(academicApiFetch).toHaveBeenNthCalledWith(
      1,
      AcademicScope.INSTITUTIONAL,
      `/api/v1/institutions/${INSTITUTION_ID}/training-paths/${RESOURCE_ID}`,
      expect.objectContaining({ body: JSON.stringify({ name: "CAVI", description: "Formación docente." }) }),
    );
    expect(academicApiFetch).toHaveBeenLastCalledWith(
      AcademicScope.INSTITUTIONAL,
      `/api/v1/institutions/${INSTITUTION_ID}/training-paths/${RESOURCE_ID}/status`,
      expect.objectContaining({ body: JSON.stringify({ active: false }), method: "PATCH" }),
    );
  });

  it("deletes study plans with the dedicated delete permission", async () => {
    const institutionId = "05b84ac4-66aa-409f-a813-012d15b8cb9b";
    const studyPlanId = "2d9ec931-453c-4778-86a9-dc40a06d0247";
    jest.mocked(requireInstitutionalUser).mockResolvedValue({
      userId: "user-id",
      personId: "person-id",
      name: "Ana",
      lastName: "García",
      documentNumber: "12345678",
      institutionId,
      roles: [],
      permissions: [INSTITUTIONAL_PERMISSION.STUDY_PLAN_DELETE],
    });
    jest.mocked(academicApiFetch).mockResolvedValue(new Response(null, { status: 204 }));

    await deleteAcademicResourceAction(
      AcademicScope.INSTITUTIONAL,
      institutionId,
      AcademicResource.STUDY_PLAN,
      studyPlanId,
      "/study-plans?page=1",
      {},
      new FormData(),
    );

    expect(academicApiFetch).toHaveBeenCalledWith(
      AcademicScope.INSTITUTIONAL,
      `/api/v1/institutions/${institutionId}/study-plans/${studyPlanId}`,
      { method: "DELETE" },
    );
  });

  it("updates an academic-space status with the dedicated permission", async () => {
    const institutionId = "05b84ac4-66aa-409f-a813-012d15b8cb9b";
    const academicSpaceId = "2d9ec931-453c-4778-86a9-dc40a06d0247";
    jest.mocked(requireInstitutionalUser).mockResolvedValue({
      userId: "user-id",
      personId: "person-id",
      name: "Ana",
      lastName: "García",
      documentNumber: "12345678",
      institutionId,
      roles: [],
      permissions: [INSTITUTIONAL_PERMISSION.ACADEMIC_SPACE_STATUS_UPDATE],
    });
    jest.mocked(academicApiFetch).mockResolvedValue(new Response(null, { status: 204 }));

    const formData = new FormData();
    formData.set("active", "false");

    await updateAcademicStatusAction(
      AcademicScope.INSTITUTIONAL,
      institutionId,
      AcademicResource.ACADEMIC_SPACE,
      academicSpaceId,
      "/academic-spaces?active=true&page=1",
      {},
      formData,
    );

    expect(academicApiFetch).toHaveBeenCalledWith(
      AcademicScope.INSTITUTIONAL,
      `/api/v1/institutions/${institutionId}/academic-spaces/${academicSpaceId}/status`,
      expect.objectContaining({ body: JSON.stringify({ active: false }), method: "PATCH" }),
    );
  });

  it("updates an instrument status with the dedicated permission", async () => {
    const institutionId = "05b84ac4-66aa-409f-a813-012d15b8cb9b";
    const instrumentId = "2d9ec931-453c-4778-86a9-dc40a06d0247";
    jest.mocked(requireInstitutionalUser).mockResolvedValue({
      userId: "user-id",
      personId: "person-id",
      name: "Ana",
      lastName: "García",
      documentNumber: "12345678",
      institutionId,
      roles: [],
      permissions: [INSTITUTIONAL_PERMISSION.INSTRUMENT_STATUS_UPDATE],
    });
    jest.mocked(academicApiFetch).mockResolvedValue(new Response(null, { status: 204 }));

    const formData = new FormData();
    formData.set("active", "false");

    await updateAcademicStatusAction(
      AcademicScope.INSTITUTIONAL,
      institutionId,
      AcademicResource.INSTRUMENT,
      instrumentId,
      "/instruments?active=true&page=1",
      {},
      formData,
    );

    expect(academicApiFetch).toHaveBeenCalledWith(
      AcademicScope.INSTITUTIONAL,
      `/api/v1/institutions/${institutionId}/instruments/${instrumentId}/status`,
      expect.objectContaining({ body: JSON.stringify({ active: false }), method: "PATCH" }),
    );
  });

  it.each([
    ["true", true, AcademicResource.TRAINING_PATH, INSTITUTIONAL_PERMISSION.TRAINING_PATH_STATUS_UPDATE],
    ["false", false, AcademicResource.TRAINING_PATH, INSTITUTIONAL_PERMISSION.TRAINING_PATH_STATUS_UPDATE],
    ["true", true, AcademicResource.ACADEMIC_SPACE, INSTITUTIONAL_PERMISSION.ACADEMIC_SPACE_STATUS_UPDATE],
    ["false", false, AcademicResource.ACADEMIC_SPACE, INSTITUTIONAL_PERMISSION.ACADEMIC_SPACE_STATUS_UPDATE],
    ["true", true, AcademicResource.INSTRUMENT, INSTITUTIONAL_PERMISSION.INSTRUMENT_STATUS_UPDATE],
    ["false", false, AcademicResource.INSTRUMENT, INSTITUTIONAL_PERMISSION.INSTRUMENT_STATUS_UPDATE],
  ] as const)(
    "sends %s as active=%s for %s only after validating the raw form value",
    async (rawActive, active, resource, permission) => {
      mockInstitutionalUser(permission);
      jest.mocked(academicApiFetch).mockResolvedValue(new Response(null, { status: 204 }));
      const formData = new FormData();
      formData.set("active", rawActive);

      await updateAcademicStatusAction(
        AcademicScope.INSTITUTIONAL,
        INSTITUTION_ID,
        resource,
        RESOURCE_ID,
        `/${resource}`,
        {},
        formData,
      );

      expect(academicApiFetch).toHaveBeenLastCalledWith(
        AcademicScope.INSTITUTIONAL,
        `/api/v1/institutions/${INSTITUTION_ID}/${resource}/${RESOURCE_ID}/status`,
        expect.objectContaining({ body: JSON.stringify({ active }), method: "PATCH" }),
      );
    },
  );

  it.each([
    [AcademicResource.TRAINING_PATH, INSTITUTIONAL_PERMISSION.TRAINING_PATH_STATUS_UPDATE, undefined],
    [AcademicResource.ACADEMIC_SPACE, INSTITUTIONAL_PERMISSION.ACADEMIC_SPACE_STATUS_UPDATE, "unknown"],
    [AcademicResource.INSTRUMENT, INSTITUTIONAL_PERMISSION.INSTRUMENT_STATUS_UPDATE, "falsey"],
  ] as const)("rejects malformed active input for %s without calling the API", async (resource, permission, active) => {
    mockInstitutionalUser(permission);
    const formData = new FormData();
    if (active !== undefined) formData.set("active", active);
    jest.mocked(academicApiFetch).mockClear();

    const result = await updateAcademicStatusAction(
      AcademicScope.INSTITUTIONAL,
      INSTITUTION_ID,
      resource,
      RESOURCE_ID,
      `/${resource}`,
      {},
      formData,
    );

    expect(result?.fieldErrors?.active).toBeDefined();
    expect(academicApiFetch).not.toHaveBeenCalled();
  });

  it("returns a dialog-safe error when deletion fails before an HTTP response", async () => {
    mockInstitutionalUser(INSTITUTIONAL_PERMISSION.STUDY_PLAN_DELETE);
    jest.mocked(academicApiFetch).mockRejectedValueOnce(new Error("network unavailable"));

    const result = await deleteAcademicResourceAction(
      AcademicScope.INSTITUTIONAL,
      INSTITUTION_ID,
      AcademicResource.STUDY_PLAN,
      RESOURCE_ID,
      "/study-plans",
      {},
      new FormData(),
    );

    expect(result).toEqual({ error: "No se pudo eliminar el elemento." });
  });
});

function mockInstitutionalUser(permission: InstitutionalPermission): void {
  jest.mocked(requireInstitutionalUser).mockResolvedValue({
    userId: "user-id",
    personId: "person-id",
    name: "Ana",
    lastName: "García",
    documentNumber: "12345678",
    institutionId: INSTITUTION_ID,
    roles: [],
    permissions: [permission],
  });
}
