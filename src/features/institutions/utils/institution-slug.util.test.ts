import { createInstitutionSlug } from "./institution-slug.util";

describe("createInstitutionSlug", () => {
  it.each([
    ["Conservatorio Superior de Música", "conservatorio-superior-de-musica"],
    ["  Instituto Nº 1 — Córdoba  ", "instituto-n-1-cordoba"],
    ["Escuela + Arte / Diseño", "escuela-arte-diseno"],
  ])("normalizes %s", (name, expected) => {
    expect(createInstitutionSlug(name)).toBe(expected);
  });

  it("limits the slug to 100 characters without leaving a trailing hyphen", () => {
    const name = `${"a".repeat(99)} institución`;

    expect(createInstitutionSlug(name)).toBe("a".repeat(99));
  });
});
