import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { PersonRolesManager } from "./person-roles-manager";
import type { AssignableRole, PersonRole, SystemRoleCode } from "../types/person-role.types";

const applicantRole: AssignableRole = {
  id: "019bffff-0000-7000-8000-000000000001",
  name: "Postulante",
  technicalCode: "APPLICANT",
};
const administrativeRole: AssignableRole = {
  id: "019bffff-0000-7000-8000-000000000002",
  name: "Administrativo",
  technicalCode: null,
};

function assignedRole(roleCode: SystemRoleCode): PersonRole {
  const role = roleCode === "APPLICANT" ? applicantRole : administrativeRole;

  return {
    roleId: role.id,
    technicalCode: role.technicalCode,
    displayName: role.name,
    assignedAt: "2026-07-17T21:03:00Z",
  };
}

function renderManager(
  selectedRoleCodes: string[],
  onSelectedRoleCodesChange: (roleCodes: string[]) => void,
  options: { canAssignRoles: boolean; canRevokeRoles: boolean },
): void {
  render(
    <PersonRolesManager
      roles={[applicantRole, administrativeRole]}
      assignedRoles={[assignedRole("APPLICANT")]}
      selectedRoleCodes={selectedRoleCodes}
      onSelectedRoleCodesChange={onSelectedRoleCodesChange}
      {...options}
    />,
  );
}

describe("PersonRolesManager", () => {
  it("replaces applicant when assigning another role with only assign permission", async () => {
    const user = userEvent.setup();
    const onSelectedRoleCodesChange = jest.fn();

    renderManager([applicantRole.id], onSelectedRoleCodesChange, {
      canAssignRoles: true,
      canRevokeRoles: false,
    });

    await user.click(screen.getByRole("button", { name: "Asignar" }));

    expect(onSelectedRoleCodesChange).toHaveBeenCalledWith([administrativeRole.id]);
  });

  it("allows restoring applicant when it cancels a pending replacement", async () => {
    const user = userEvent.setup();
    const onSelectedRoleCodesChange = jest.fn();

    renderManager([administrativeRole.id], onSelectedRoleCodesChange, {
      canAssignRoles: true,
      canRevokeRoles: false,
    });

    await user.click(screen.getByRole("button", { name: "Asignar" }));

    expect(onSelectedRoleCodesChange).toHaveBeenCalledWith([applicantRole.id]);
  });

  it("disables assigning another role without assign permission", () => {
    renderManager([applicantRole.id], jest.fn(), {
      canAssignRoles: false,
      canRevokeRoles: true,
    });

    expect(screen.getByRole("button", { name: "Asignar" })).toBeDisabled();
  });
});
