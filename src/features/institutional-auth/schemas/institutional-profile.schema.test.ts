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
  it("validates valid input", () => {
    expect(institutionalProfileSchema.safeParse(createValidProfileInput()).success).toBe(true);
  });

  it("rejects names shorter than 3 characters", () => {
    const result = institutionalProfileSchema.safeParse(createValidProfileInput({ firstName: "Al" }));

    expect(result.success).toBe(false);
  });

  it("rejects invalid emails", () => {
    const result = institutionalProfileSchema.safeParse(createValidProfileInput({ email: "not-an-email" }));

    expect(result.success).toBe(false);
  });
});
