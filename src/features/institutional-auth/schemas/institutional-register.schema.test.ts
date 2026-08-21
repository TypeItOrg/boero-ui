import { getLatestAllowedBirthDate } from "@features/people/utils/person-birth-date.util";
import { institutionalRegisterSchema } from "@features/institutional-auth/schemas/institutional-register.schema";

function createValidInput(overrides: Record<string, string> = {}) {
  return {
    institutionId: "institution-id",
    name: "Ana",
    lastName: "Garcia",
    birthDate: "2010-01-01",
    documentNumber: "12345678",
    password: "password123",
    confirmPassword: "password123",
    ...overrides,
  };
}

describe("institutional register schema", () => {
  it("requires a birth date", () => {
    const result = institutionalRegisterSchema.safeParse(createValidInput({ birthDate: "" }));

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues).toContainEqual(expect.objectContaining({ path: ["birthDate"], message: "La fecha de nacimiento es requerida." }));
    }
  });

  it("rejects a birth date younger than the minimum age", () => {
    const tooRecentBirthDate = getLatestAllowedBirthDate();
    tooRecentBirthDate.setDate(tooRecentBirthDate.getDate() + 1);
    const birthDate = [
      tooRecentBirthDate.getFullYear(),
      String(tooRecentBirthDate.getMonth() + 1).padStart(2, "0"),
      String(tooRecentBirthDate.getDate()).padStart(2, "0"),
    ].join("-");

    const result = institutionalRegisterSchema.safeParse(createValidInput({ birthDate }));

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues).toContainEqual(expect.objectContaining({ path: ["birthDate"], message: "La persona debe tener al menos 3 años." }));
    }
  });
});
