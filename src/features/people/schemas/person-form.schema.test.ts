import { createPersonFormSchema, updatePersonFormSchema } from "@features/people/schemas/person-form.schema";

const validPerson = {
  firstName: "Ana",
  lastName: "Pérez",
  documentNumber: "12345678",
  email: "ana@example.com",
  phoneNumber: "",
  birthDate: "2000-01-01",
  password: "contraseña-segura",
  confirmPassword: "contraseña-segura",
};

describe("person form schemas", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date("2026-09-14T15:00:00Z"));
  });

  afterEach(() => jest.useRealTimers());

  it.each(["", "353-4619146"])("accepts a supported phone number %s", (phoneNumber) => {
    expect(updatePersonFormSchema.parse({ ...validPerson, phoneNumber })).toMatchObject({ phoneNumber });
  });

  it.each([
    ["phoneNumber", "+54 353 4619146", "El teléfono solo admite números y guiones."],
    ["documentNumber", "1234A678", "El documento debe tener exactamente 8 dígitos."],
    ["birthDate", "", "La fecha de nacimiento es requerida."],
    ["birthDate", "2023-09-15", "La persona debe tener al menos 3 años."],
    ["confirmPassword", "diferente-contraseña", "Las contraseñas no coinciden."],
  ])("rejects invalid %s (%s) for its own validation rule", (field, value, message) => {
    const result = createPersonFormSchema.safeParse({ ...validPerson, [field]: value });

    expect(result).toMatchObject({
      success: false,
      error: { issues: [expect.objectContaining({ path: [field], message })] },
    });
  });

  it("accepts the exact third birthday", () => {
    expect(createPersonFormSchema.parse({ ...validPerson, birthDate: "2023-09-14" })).toEqual({
      ...validPerson,
      birthDate: "2023-09-14",
    });
  });

  it.each([
    ["empty", { password: "", confirmPassword: "" }],
    ["omitted", { password: undefined, confirmPassword: undefined }],
  ])("keeps %s update credentials empty", (_case, credentials) => {
    expect(updatePersonFormSchema.parse({ ...validPerson, ...credentials })).toMatchObject({
      password: "",
      confirmPassword: "",
    });
  });

  it.each([
    ["phoneNumber", { phoneNumber: "+54 353 4619146" }, "El teléfono solo admite números y guiones."],
    ["password", { password: "123", confirmPassword: "123" }, "La contraseña debe tener al menos 8 caracteres."],
    ["confirmPassword", { password: "contraseña-nueva", confirmPassword: "otra-contraseña" }, "Las contraseñas no coinciden."],
  ])("rejects invalid update %s", (field, credentials, message) => {
    expect(updatePersonFormSchema.safeParse({ ...validPerson, ...credentials })).toMatchObject({
      success: false,
      error: { issues: [expect.objectContaining({ path: [field], message })] },
    });
  });

  it("accepts matching new credentials", () => {
    const credentials = { password: "contraseña-nueva", confirmPassword: "contraseña-nueva" };

    expect(updatePersonFormSchema.parse({ ...validPerson, ...credentials })).toMatchObject(credentials);
  });
});
