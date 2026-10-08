import { institutionalProfileSchema } from "@features/institutional-auth/schemas/institutional-profile.schema";

const validProfile = {
  firstName: "Matias",
  lastName: "Boero",
  birthDate: "1995-05-15",
  email: "matias@example.com",
  phoneNumber: "12345678",
};

describe("institutionalProfileSchema", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date("2026-09-14T15:00:00Z"));
  });

  afterEach(() => jest.useRealTimers());

  it("normalizes valid identity fields", () => {
    expect(institutionalProfileSchema.parse({ ...validProfile, firstName: " Matias ", email: " matias@example.com " })).toEqual(validProfile);
  });

  it.each([
    ["firstName", "Al", "El nombre debe tener al menos 3 caracteres."],
    ["lastName", "Bo", "El apellido debe tener al menos 3 caracteres."],
    ["email", "not-an-email", "Ingresá un email válido."],
    ["phoneNumber", "+54 123", "El teléfono solo admite números y guiones."],
    ["birthDate", "2023-09-15", "La persona debe tener al menos 3 años."],
  ])("reports the rule for invalid %s", (field, value, message) => {
    expect(institutionalProfileSchema.safeParse({ ...validProfile, [field]: value })).toMatchObject({
      success: false,
      error: { issues: [expect.objectContaining({ path: [field], message })] },
    });
  });

  it("validates an incomplete address independently", () => {
    expect(institutionalProfileSchema.safeParse({ ...validProfile, address: { cityId: "", street: " " } })).toMatchObject({
      success: false,
      error: {
        issues: [
          expect.objectContaining({ path: ["address", "cityId"], message: "La ciudad es requerida." }),
          expect.objectContaining({ path: ["address", "street"], message: "La calle es requerida." }),
        ],
      },
    });
  });
});
