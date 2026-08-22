import { institutionalPasswordSchema } from "@features/institutional-auth/schemas/institutional-password.schema";

function createValidInput(overrides: Record<string, unknown> = {}) {
  return {
    currentPassword: "oldpassword123",
    password: "newpassword123",
    confirmPassword: "newpassword123",
    ...overrides,
  };
}

describe("institutionalPasswordSchema", () => {
  it("validates matching passwords", () => {
    expect(institutionalPasswordSchema.safeParse(createValidInput()).success).toBe(true);
  });

  it("requires the current password", () => {
    const result = institutionalPasswordSchema.safeParse(createValidInput({ currentPassword: "" }));

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues).toContainEqual(expect.objectContaining({ path: ["currentPassword"], message: "Ingresá tu contraseña actual." }));
    }
  });

  it("rejects passwords shorter than 8 characters", () => {
    const result = institutionalPasswordSchema.safeParse(createValidInput({ password: "short", confirmPassword: "short" }));

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues).toContainEqual(
        expect.objectContaining({ path: ["password"], message: "La contraseña debe tener al menos 8 caracteres." }),
      );
    }
  });

  it("requires the password confirmation", () => {
    const result = institutionalPasswordSchema.safeParse(createValidInput({ confirmPassword: "" }));

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues).toContainEqual(expect.objectContaining({ path: ["confirmPassword"], message: "Debés confirmar la contraseña." }));
    }
  });

  it("rejects mismatching passwords", () => {
    const result = institutionalPasswordSchema.safeParse(createValidInput({ confirmPassword: "differentpassword" }));

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues).toContainEqual(expect.objectContaining({ path: ["confirmPassword"], message: "Las contraseñas no coinciden." }));
    }
  });
});
