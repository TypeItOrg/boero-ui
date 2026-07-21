import { institutionFormSchema } from "@features/institutions/schemas/institution-form.schema";

const VALID_REQUIRED_FIELDS = {
  name: "Conservatorio Felipe Boero",
  slug: "felipe-boero",
  cityId: "019e18e4-cee5-74a1-9a6d-54cc0be88405",
};

describe("institutionFormSchema", () => {
  it("only requires the fields required by the backend", () => {
    const result = institutionFormSchema.safeParse({
      ...VALID_REQUIRED_FIELDS,
      street: "",
      number: "",
      neighborhood: "",
      additionalInfo: "",
      phoneNumber: "",
      email: "",
    });

    expect(result.success).toBe(true);
  });

  it.each(["name", "slug", "cityId"] as const)("requires %s", (field) => {
    const result = institutionFormSchema.safeParse({
      ...VALID_REQUIRED_FIELDS,
      [field]: "",
      street: "",
      number: "",
      neighborhood: "",
      additionalInfo: "",
      phoneNumber: "",
      email: "",
    });

    expect(result.success).toBe(false);
  });

  it.each([
    ["number", "12A"],
    ["phoneNumber", "+54 353 123456"],
  ] as const)("rejects unsupported characters in %s", (field, value) => {
    const result = institutionFormSchema.safeParse({
      ...VALID_REQUIRED_FIELDS,
      street: "",
      number: "",
      neighborhood: "",
      additionalInfo: "",
      phoneNumber: "",
      email: "",
      [field]: value,
    });

    expect(result.success).toBe(false);
  });
});
