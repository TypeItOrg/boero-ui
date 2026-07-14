import { formatSelectionCountLabel } from "./selection-count-label.util";

describe("formatSelectionCountLabel", () => {
  it("uses singular labels when total items is one", () => {
    expect(
      formatSelectionCountLabel({
        selectedItems: 0,
        totalItems: 1,
        singularItemLabel: "institución",
        pluralItemLabel: "instituciones",
        singularSelectionLabel: "seleccionada",
        pluralSelectionLabel: "seleccionadas",
      }),
    ).toBe("0 de 1 institución seleccionada.");
  });

  it("uses plural labels when total items is not one", () => {
    expect(
      formatSelectionCountLabel({
        selectedItems: 1,
        totalItems: 2,
        singularItemLabel: "institución",
        pluralItemLabel: "instituciones",
        singularSelectionLabel: "seleccionada",
        pluralSelectionLabel: "seleccionadas",
      }),
    ).toBe("1 de 2 instituciones seleccionadas.");
  });
});
