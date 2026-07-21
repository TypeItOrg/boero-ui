import { createPersonFormSchema, updatePersonFormSchema } from "@features/people/schemas/person-form.schema";
import { getLatestAllowedBirthDate } from "@features/people/utils/person-birth-date.util";

describe("person form schemas", () => {
  it("accepts phone numbers with digits and hyphens", () => {
    const result = updatePersonFormSchema.safeParse({
      firstName: "Ana",
      lastName: "Pérez",
      email: "",
      phoneNumber: "353-4619146",
    });

    expect(result.success).toBe(true);
  });

  it("rejects unsupported phone characters", () => {
    const result = updatePersonFormSchema.safeParse({
      firstName: "Ana",
      lastName: "Pérez",
      email: "",
      phoneNumber: "+54 353 4619146",
    });

    expect(result.success).toBe(false);
  });

  it("rejects non-numeric document numbers", () => {
    const result = createPersonFormSchema.safeParse({
      firstName: "Ana",
      lastName: "Pérez",
      documentNumber: "1234A678",
      email: "",
      phoneNumber: "",
      birthDate: "",
      password: "contraseña-segura",
    });

    expect(result.success).toBe(false);
  });

  it("rejects birth dates for people younger than three", () => {
    const tomorrowThreeYearsAgo = getLatestAllowedBirthDate();
    tomorrowThreeYearsAgo.setDate(tomorrowThreeYearsAgo.getDate() + 1);
    const birthDate = [
      tomorrowThreeYearsAgo.getFullYear(),
      String(tomorrowThreeYearsAgo.getMonth() + 1).padStart(2, "0"),
      String(tomorrowThreeYearsAgo.getDate()).padStart(2, "0"),
    ].join("-");

    const result = createPersonFormSchema.safeParse({
      firstName: "Ana",
      lastName: "Pérez",
      documentNumber: "12345678",
      email: "",
      phoneNumber: "",
      birthDate,
      password: "contraseña-segura",
    });

    expect(result.success).toBe(false);
  });

  it("requires a birth date when creating a person", () => {
    const result = createPersonFormSchema.safeParse({
      firstName: "Ana",
      lastName: "Pérez",
      documentNumber: "12345678",
      email: "",
      phoneNumber: "",
      birthDate: "",
      password: "contraseña-segura",
    });

    expect(result.success).toBe(false);
  });
});
