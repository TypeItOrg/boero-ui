import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { PermissionGroupsFields } from "@features/roles/components/permission-groups-fields";
import type { InstitutionPermissionGroup } from "@features/roles/types/institution-role.types";

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
});
