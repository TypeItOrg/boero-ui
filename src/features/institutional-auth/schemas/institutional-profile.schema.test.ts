import { institutionalProfileSchema } from "@features/institutional-auth/schemas/institutional-profile.schema";

function createValidProfileInput(overrides: Record<string, unknown> = {}) {
  return {
    firstName: "Matias",
    lastName: "Boero",
    birthDate: "1995-05-15",
    email: "matias@example.com",
    phoneNumber: "12345678",
    ...overrides,
  };
}

describe("institutionalProfileSchema", () => {
  it("validates valid input without password", () => {
    const result = institutionalProfileSchema.safeParse(createValidProfileInput());
    expect(result.success).toBe(true);
  });

  it("validates valid input with matching password", () => {
    const result = institutionalProfileSchema.safeParse(
      createValidProfileInput({
        currentPassword: "oldpassword123",
        password: "newpassword123",
        confirmPassword: "newpassword123",
      }),
    );
    expect(result.success).toBe(true);
  });

  it("rejects password shorter than 8 characters", () => {
    const result = institutionalProfileSchema.safeParse(
      createValidProfileInput({
        currentPassword: "oldpassword123",
        password: "short",
        confirmPassword: "short",
      }),
    );
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues).toContainEqual(
        expect.objectContaining({ path: ["password"], message: "La contraseña debe tener al menos 8 caracteres." }),
      );
    }
  });

  it("rejects mismatching passwords", () => {
    const result = institutionalProfileSchema.safeParse(
      createValidProfileInput({
        currentPassword: "oldpassword123",
        password: "password123",
        confirmPassword: "differentpassword",
      }),
    );
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues).toContainEqual(expect.objectContaining({ path: ["confirmPassword"], message: "Las contraseñas no coinciden." }));
    }
  });

  it("requires the current password when a new password is provided", () => {
    const result = institutionalProfileSchema.safeParse(createValidProfileInput({ password: "newpassword123", confirmPassword: "newpassword123" }));

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues).toContainEqual(
        expect.objectContaining({
          path: ["currentPassword"],
          message: "Ingresá tu contraseña actual.",
        }),
      );
    }
  });
});
