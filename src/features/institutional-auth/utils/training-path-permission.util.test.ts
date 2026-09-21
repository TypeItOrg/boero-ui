import { scopeIncludesTrainingPath } from "@features/institutional-auth/utils/institutional-permission.util";
import { INSTITUTIONAL_PERMISSION as P } from "@features/institutional-auth/types/institutional-permission.types";
import type { InstitutionalUser } from "@features/institutional-auth/types/institutional-user.types";

describe("permission-specific training path grants", () => {
  const scopes: InstitutionalUser["permissionScopes"] = {
    [P.ENROLLMENT_APPLICATION_READ]: { accessScope: "TRAINING_PATHS", trainingPathIds: ["profesorado", "tecnicatura"] },
    [P.ENROLLMENT_APPLICATION_APPROVE]: { accessScope: "TRAINING_PATHS", trainingPathIds: ["profesorado"] },
  };
  it("does not borrow paths from another permission", () => {
    expect(scopeIncludesTrainingPath(scopes, P.ENROLLMENT_APPLICATION_READ, "tecnicatura")).toBe(true);
    expect(scopeIncludesTrainingPath(scopes, P.ENROLLMENT_APPLICATION_APPROVE, "tecnicatura")).toBe(false);
    expect(scopeIncludesTrainingPath(scopes, P.ENROLLMENT_APPLICATION_APPROVE, "profesorado")).toBe(true);
  });
  it("fails closed when scope data is missing", () => {
    expect(scopeIncludesTrainingPath(undefined, P.ENROLLMENT_APPLICATION_APPROVE, "profesorado")).toBe(false);
  });
});
