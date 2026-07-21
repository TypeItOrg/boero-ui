import {
  platformAccountFormSchema,
  platformAccountUpdateFormSchema,
} from "@features/platform-accounts/schemas/platform-account-form.schema";

const validAccount = {
  name: "María",
  lastName: "González",
  email: "admin@boero.edu.ar",
  password: "password123",
  confirmPassword: "password123",
};

describe("platformAccountFormSchema", () => {
  it("normalizes names and email", () => {
    const result = platformAccountFormSchema.parse({
      ...validAccount,
      name: "  María  ",
      email: "  admin@boero.edu.ar  ",
    });

    expect(result.name).toBe("María");
    expect(result.email).toBe("admin@boero.edu.ar");
  });

  it("rejects a mismatched password confirmation", () => {
    const result = platformAccountFormSchema.safeParse({
      ...validAccount,
      confirmPassword: "different-password",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ path: ["confirmPassword"], message: "Las contraseñas no coinciden." }),
        ]),
      );
    }
  });

  it("rejects short passwords and invalid names", () => {
    const result = platformAccountFormSchema.safeParse({
      ...validAccount,
      name: "Ma1",
      password: "short",
      confirmPassword: "short",
    });

    expect(result.success).toBe(false);
  });
});

describe("platformAccountUpdateFormSchema", () => {
  it("accepts an empty password without changing credentials", () => {
    expect(
      platformAccountUpdateFormSchema.safeParse({
        ...validAccount,
        password: "",
        confirmPassword: "",
      }).success,
    ).toBe(true);
  });

  it("validates an optional password when provided", () => {
    const result = platformAccountUpdateFormSchema.safeParse({
      ...validAccount,
      password: "short",
      confirmPassword: "different",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ path: ["password"] }),
          expect.objectContaining({ path: ["confirmPassword"] }),
        ]),
      );
    }
  });
});
