jest.mock("next/cache", () => ({ revalidatePath: jest.fn() }));
jest.mock("next/navigation", () => ({ redirect: jest.fn() }));
jest.mock("@features/academic/services/academic-api-fetch.service", () => ({ academicApiFetch: jest.fn() }));
jest.mock("@features/institutional-auth/services/get-institutional-user.service", () => ({
  requireInstitutionalUser: jest.fn(),
}));
jest.mock("@features/platform-auth/services/get-platform-account.service", () => ({
  requirePlatformAccount: jest.fn(),
}));

import { saveAcademicResourceAction } from "@features/academic/actions/academic-resource.action";
import { academicApiFetch } from "@features/academic/services/academic-api-fetch.service";
import { AcademicResource } from "@features/academic/types/academic-resource.types";
import { INSTITUTIONAL_PERMISSION } from "@features/institutional-auth/types/institutional-permission.types";
import { requireInstitutionalUser } from "@features/institutional-auth/services/get-institutional-user.service";
import { AcademicScope } from "@features/academic/utils/academic-scope.util";
import { requirePlatformAccount } from "@features/platform-auth/services/get-platform-account.service";

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
});
