import { institutionalRegisterSchema } from "@features/institutional-auth/schemas/institutional-register.schema";

const validRegistration = {
  institutionId: "019e6d85-d070-7000-8000-000000000001",
  name: "Ana",
  lastName: "Garcia",
  email: "ana@example.com",
  birthDate: "2010-01-01",
  documentNumber: "12345678",
  password: "password123",
  confirmPassword: "password123",
};

describe("institutional register schema", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date("2026-09-14T15:00:00Z"));
  });

  afterEach(() => jest.useRealTimers());

  it("accepts a complete registration and normalizes identity fields", () => {
    expect(
      institutionalRegisterSchema.parse({
        ...validRegistration,
        name: " Ana ",
        lastName: " Garcia ",
        email: " ana@example.com ",
      }),
    ).toEqual(validRegistration);
  });

  it.each([
    ["birthDate", "", "La fecha de nacimiento es requerida."],
    ["birthDate", "2023-09-15", "La persona debe tener al menos 3 años."],
    ["documentNumber", "1234A678", "El número de documento debe tener exactamente 8 dígitos."],
    ["email", "", "El correo electrónico es requerido."],
    ["email", "not-an-email", "El correo electrónico debe tener un formato válido."],
    ["confirmPassword", "different-password", "Las contraseñas no coinciden."],
  ])("rejects invalid %s (%s) independently", (field, value, message) => {
    expect(institutionalRegisterSchema.safeParse({ ...validRegistration, [field]: value })).toMatchObject({
      success: false,
      error: { issues: [expect.objectContaining({ path: [field], message })] },
    });
  });

  it("accepts the exact third birthday", () => {
    expect(institutionalRegisterSchema.parse({ ...validRegistration, birthDate: "2023-09-14" })).toMatchObject({
      birthDate: "2023-09-14",
    });
  });
});
