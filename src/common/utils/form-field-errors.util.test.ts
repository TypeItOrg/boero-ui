import { getFieldErrors, pickFieldErrors } from "@common/utils/form-field-errors.util";

describe("form field errors", () => {
  const fields = ["name", "slug"] as const;

  it("picks only recognized errors with a message", () => {
    expect(
      pickFieldErrors(
        {
          slug: "Ya existe una institución con ese slug.",
          ignored: "Error desconocido",
        },
        fields,
      ),
    ).toEqual({ slug: "Ya existe una institución con ese slug." });
  });

  it("does not add undefined entries when field errors are absent", () => {
    expect(pickFieldErrors(undefined, fields)).toEqual({});
  });

  it("maps validation issues for recognized fields", () => {
    expect(
      getFieldErrors(
        [
          { path: ["name"], message: "El nombre es requerido." },
          { path: ["ignored"], message: "Error desconocido" },
        ],
        fields,
      ),
    ).toEqual({ name: "El nombre es requerido." });
  });

  it("maps nested issue paths to dot-separated field names", () => {
    expect(
      getFieldErrors(
        [
          { path: ["address", "cityId"], message: "La ciudad es requerida." },
          { path: ["address", "street"], message: "La calle es requerida." },
        ],
        ["address.cityId", "address.street"],
      ),
    ).toEqual({
      "address.cityId": "La ciudad es requerida.",
      "address.street": "La calle es requerida.",
    });
  });
});
