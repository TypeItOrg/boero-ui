import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { PermissionGroupsFields } from "@features/roles/components/permission-groups-fields";
import type { InstitutionPermissionGroup } from "@features/roles/types/institution-permission-group.types";

const mockPermissionGroups: InstitutionPermissionGroup[] = [
  {
    code: "users",
    displayName: "Usuarios",
    description: "Gestión de usuarios",
    permissions: [
      {
        code: "person:read:any",
        description: "Ver usuarios",
        grantable: true,
        requiredPermissions: [],
      },
      {
        code: "person:create",
        description: "Crear usuarios",
        grantable: true,
        requiredPermissions: ["person:read:any"],
      },
      {
        code: "person:update",
        description: "Editar usuarios",
        grantable: true,
        requiredPermissions: ["person:read:any"],
      },
    ],
  },
];

const mockAcademicPermissionGroup: InstitutionPermissionGroup = {
  code: "academic",
  displayName: "Académico",
  description: "Configuración académica",
  permissions: [
    {
      code: "academic-year:read",
      description: "Ver ciclos lectivos",
      grantable: true,
      requiredPermissions: [],
    },
    {
      code: "academic-year:create",
      description: "Crear ciclos lectivos",
      grantable: true,
      requiredPermissions: ["academic-year:read"],
    },
    {
      code: "academic-year:update",
      description: "Editar ciclos lectivos",
      grantable: true,
      requiredPermissions: ["academic-year:read"],
    },
    {
      code: "academic-year:update-status",
      description: "Cambiar estado de ciclos lectivos",
      grantable: true,
      requiredPermissions: ["academic-year:read"],
    },
    {
      code: "training-path:read",
      description: "Ver trayectos formativos",
      grantable: true,
      requiredPermissions: [],
    },
    {
      code: "training-path:create",
      description: "Crear trayectos formativos",
      grantable: true,
      requiredPermissions: ["training-path:read"],
    },
  ],
};

describe("PermissionGroupsFields", () => {
  it("automatically checks and disables required permission when parent permission is checked", async () => {
    const user = userEvent.setup();
    render(<PermissionGroupsFields groups={mockPermissionGroups} />);

    const createCheckbox = screen.getByRole("checkbox", { name: "Crear usuarios" });
    const readCheckbox = screen.getByRole("checkbox", { name: "Ver usuarios" });

    expect(createCheckbox).not.toBeChecked();
    expect(readCheckbox).not.toBeChecked();

    await user.click(createCheckbox);

    expect(createCheckbox).toBeChecked();
    expect(readCheckbox).toBeChecked();
    expect(readCheckbox).toBeDisabled();
  });

  it("automatically unchecks required permission when parent permission is unchecked", async () => {
    const user = userEvent.setup();
    render(<PermissionGroupsFields groups={mockPermissionGroups} />);

    const createCheckbox = screen.getByRole("checkbox", { name: "Crear usuarios" });
    const readCheckbox = screen.getByRole("checkbox", { name: "Ver usuarios" });

    await user.click(createCheckbox);
    expect(readCheckbox).toBeChecked();

    await user.click(createCheckbox);
    expect(createCheckbox).not.toBeChecked();
    expect(readCheckbox).not.toBeChecked();
    expect(readCheckbox).not.toBeDisabled();
  });

  it("keeps required permission checked if another parent permission still requires it", async () => {
    const user = userEvent.setup();
    render(<PermissionGroupsFields groups={mockPermissionGroups} />);

    const createCheckbox = screen.getByRole("checkbox", { name: "Crear usuarios" });
    const updateCheckbox = screen.getByRole("checkbox", { name: "Editar usuarios" });
    const readCheckbox = screen.getByRole("checkbox", { name: "Ver usuarios" });

    await user.click(createCheckbox);
    await user.click(updateCheckbox);

    expect(readCheckbox).toBeChecked();
    expect(readCheckbox).toBeDisabled();

    // Uncheck "Crear usuarios"
    await user.click(createCheckbox);
    expect(createCheckbox).not.toBeChecked();
    expect(readCheckbox).toBeChecked();
    expect(readCheckbox).toBeDisabled();

    // Uncheck "Editar usuarios"
    await user.click(updateCheckbox);
    expect(updateCheckbox).not.toBeChecked();
    expect(readCheckbox).not.toBeChecked();
    expect(readCheckbox).not.toBeDisabled();
  });

  it("retains required permission if it was explicitly selected by the user before parent permission was checked", async () => {
    const user = userEvent.setup();
    render(<PermissionGroupsFields groups={mockPermissionGroups} />);

    const createCheckbox = screen.getByRole("checkbox", { name: "Crear usuarios" });
    const readCheckbox = screen.getByRole("checkbox", { name: "Ver usuarios" });

    // Explicitly check "Ver usuarios" first
    await user.click(readCheckbox);
    expect(readCheckbox).toBeChecked();
    expect(readCheckbox).not.toBeDisabled();

    // Check "Crear usuarios"
    await user.click(createCheckbox);
    expect(readCheckbox).toBeDisabled();

    // Uncheck "Crear usuarios"
    await user.click(createCheckbox);
    expect(createCheckbox).not.toBeChecked();
    expect(readCheckbox).toBeChecked();
    expect(readCheckbox).not.toBeDisabled();
  });

  it("renders each dependent permission below its own parent", () => {
    render(<PermissionGroupsFields groups={[mockAcademicPermissionGroup]} />);

    const createYearField = screen.getByText("Crear ciclos lectivos").closest<HTMLElement>('[data-slot="field"]');
    const createTrainingPathField = screen
      .getByText("Crear trayectos formativos")
      .closest<HTMLElement>('[data-slot="field"]');

    expect(createYearField).not.toBeNull();
    expect(createTrainingPathField).not.toBeNull();

    const yearBranch = createYearField?.parentElement;
    const trainingPathBranch = createTrainingPathField?.parentElement;

    expect(yearBranch).toHaveClass("border-l");
    expect(trainingPathBranch).toHaveClass("border-l");
    expect(yearBranch).toContainElement(createYearField);
    expect(yearBranch).not.toContainElement(createTrainingPathField);
    expect(trainingPathBranch).toContainElement(createTrainingPathField);
    expect(trainingPathBranch).not.toContainElement(createYearField);
  });

  it("hides GRADES permission group", () => {
    const gradesGroup: InstitutionPermissionGroup = {
      code: "GRADES",
      displayName: "Calificaciones",
      description: "Gestión de calificaciones",
      permissions: [
        {
          code: "institution:grades:enter",
          description: "Cargar calificaciones",
          grantable: true,
          requiredPermissions: [],
        },
      ],
    };

    render(<PermissionGroupsFields groups={[...mockPermissionGroups, gradesGroup]} />);

    expect(screen.queryByText("Calificaciones")).not.toBeInTheDocument();
  });
});
