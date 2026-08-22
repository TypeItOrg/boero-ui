import { INSTITUTIONAL_PERMISSION } from "@features/institutional-auth/types/institutional-permission.types";
import type { InstitutionalUser } from "@features/institutional-auth/types/institutional-user.types";
import { getInstitutionalNavigationSections } from "@features/institutional-auth/utils/institutional-navigation.util";

const USER: InstitutionalUser = {
  userId: "9512b687-3587-414d-a086-45b83016d16a",
  name: "Ana",
  lastName: "Pérez",
  documentNumber: "12345678",
  institutionId: "7e429f76-1fb4-45ee-a176-0020bc43b11d",
  roles: [],
  permissions: [],
};

describe("getInstitutionalNavigationSections", () => {
  it("shows accessible academic resources without an overview link", () => {
    const sections = getInstitutionalNavigationSections({
      ...USER,
      permissions: [INSTITUTIONAL_PERMISSION.STUDY_PLAN_READ],
    });

    expect(sections).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          label: "Académico",
          items: [expect.objectContaining({ title: "Planes de estudio", url: "/study-plans" })],
        }),
      ]),
    );
  });

  it("hides the academic hub without academic read permissions", () => {
    const sections = getInstitutionalNavigationSections(USER);

    expect(sections).not.toEqual(expect.arrayContaining([expect.objectContaining({ label: "Académico" })]));
  });

  it("shows catalog resources independently", () => {
    const spaceSections = getInstitutionalNavigationSections({
      ...USER,
      permissions: [INSTITUTIONAL_PERMISSION.ACADEMIC_SPACE_READ],
    });
    const instrumentSections = getInstitutionalNavigationSections({
      ...USER,
      permissions: [INSTITUTIONAL_PERMISSION.INSTRUMENT_READ],
    });
    const shiftSections = getInstitutionalNavigationSections({
      ...USER,
      permissions: [INSTITUTIONAL_PERMISSION.SHIFT_READ],
    });

    expect(spaceSections.find((section) => section.label === "Académico")?.items).toEqual([
      expect.objectContaining({ title: "Espacios académicos", url: "/academic-spaces" }),
    ]);
    expect(instrumentSections.find((section) => section.label === "Académico")?.items).toEqual([
      expect.objectContaining({ title: "Instrumentos", url: "/instruments" }),
    ]);
    expect(shiftSections.find((section) => section.label === "Académico")?.items).toEqual([
      expect.objectContaining({ title: "Turnos", url: "/shifts" }),
    ]);
  });

  it("places academic links after the complete platform section", () => {
    const sections = getInstitutionalNavigationSections({
      ...USER,
      permissions: [
        INSTITUTIONAL_PERMISSION.INSTITUTION_READ,
        INSTITUTIONAL_PERMISSION.PERSON_READ_ANY,
        INSTITUTIONAL_PERMISSION.ROLE_READ,
        INSTITUTIONAL_PERMISSION.ACADEMIC_YEAR_READ,
      ],
    });

    expect(sections.map((section) => section.label)).toEqual([undefined, "Plataforma", "Académico", "General"]);
    expect(sections[0]?.items.map((item) => item.title)).toEqual(["Inicio"]);
    expect(sections[1]?.items.map((item) => item.title)).toEqual(["Institución", "Usuarios", "Roles"]);
  });

  it("keeps Inicio outside labeled navigation sections", () => {
    const sections = getInstitutionalNavigationSections(USER);

    expect(sections[0]).toEqual({ items: [expect.objectContaining({ title: "Inicio", url: "/", exact: true })] });
    expect(sections.map((section) => section.label)).toEqual([undefined, "General"]);
  });
});
