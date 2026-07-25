import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { PersonRolesManager } from "@features/people/components/person-roles-manager";
import {
  SystemRoleCode,
  type AssignableRole,
  type PersonRole,
  type SystemRoleCode as SystemRoleCodeType,
} from "@features/people/types/person-role.types";
import { PeopleScope } from "@features/people/utils/people-scope.util";

const applicantRole: AssignableRole = {
  id: "019bffff-0000-7000-8000-000000000001",
  name: "Postulante",
  technicalCode: SystemRoleCode.APPLICANT,
};
const administrativeRole: AssignableRole = {
  id: "019bffff-0000-7000-8000-000000000002",
  name: "Administrativo",
  technicalCode: null,
};

function assignedRole(roleCode: SystemRoleCodeType): PersonRole {
  const role = roleCode === SystemRoleCode.APPLICANT ? applicantRole : administrativeRole;

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
      assignedRoles={[assignedRole(SystemRoleCode.APPLICANT)]}
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

  it("disables assigning applicant when institutional authority is assigned", () => {
    const authorityRole: AssignableRole = {
      id: "019bffff-0000-7000-8000-000000000003",
      name: "Administrador Institucional",
      technicalCode: SystemRoleCode.INSTITUTIONAL_AUTHORITY,
    };

    render(
      <PersonRolesManager
        roles={[applicantRole, authorityRole]}
        assignedRoles={[
          {
            roleId: authorityRole.id,
            technicalCode: SystemRoleCode.INSTITUTIONAL_AUTHORITY,
            displayName: authorityRole.name,
            assignedAt: "2026-07-17T21:03:00Z",
          },
        ]}
        selectedRoleCodes={[authorityRole.id]}
        onSelectedRoleCodesChange={jest.fn()}
        canAssignRoles={true}
        canRevokeRoles={true}
        scope={PeopleScope.INSTITUTIONAL}
      />,
    );

    expect(screen.getByRole("button", { name: "Asignar" })).toBeDisabled();
  });

  it("preserves institutional authority when assigning another role", async () => {
    const user = userEvent.setup();
    const authorityRole: AssignableRole = {
      id: "019bffff-0000-7000-8000-000000000003",
      name: "Administrador Institucional",
      technicalCode: SystemRoleCode.INSTITUTIONAL_AUTHORITY,
    };
    const onSelectedRoleCodesChange = jest.fn();

    render(
      <PersonRolesManager
        roles={[authorityRole, administrativeRole]}
        assignedRoles={[
          {
            roleId: authorityRole.id,
            technicalCode: SystemRoleCode.INSTITUTIONAL_AUTHORITY,
            displayName: authorityRole.name,
            assignedAt: "2026-07-17T21:03:00Z",
          },
        ]}
        selectedRoleCodes={[authorityRole.id]}
        onSelectedRoleCodesChange={onSelectedRoleCodesChange}
        canAssignRoles={true}
        canRevokeRoles={true}
        scope={PeopleScope.INSTITUTIONAL}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Asignar" }));

    expect(onSelectedRoleCodesChange).toHaveBeenCalledWith([authorityRole.id, administrativeRole.id]);
  });

  it("disables revoking institutional authority role in institutional scope", () => {
    const authorityRole: AssignableRole = {
      id: "019bffff-0000-7000-8000-000000000003",
      name: "Administrador Institucional",
      technicalCode: SystemRoleCode.INSTITUTIONAL_AUTHORITY,
    };

    render(
      <PersonRolesManager
        roles={[authorityRole, administrativeRole]}
        assignedRoles={[
          {
            roleId: authorityRole.id,
            technicalCode: SystemRoleCode.INSTITUTIONAL_AUTHORITY,
            displayName: authorityRole.name,
            assignedAt: "2026-07-17T21:03:00Z",
          },
          {
            roleId: administrativeRole.id,
            technicalCode: null,
            displayName: administrativeRole.name,
            assignedAt: "2026-07-17T21:03:00Z",
          },
        ]}
        selectedRoleCodes={[authorityRole.id, administrativeRole.id]}
        onSelectedRoleCodesChange={jest.fn()}
        canAssignRoles={true}
        canRevokeRoles={true}
        scope={PeopleScope.INSTITUTIONAL}
      />,
    );

    const revokeButtons = screen.getAllByRole("button", { name: "Revocar" });
    expect(revokeButtons[0]).toBeDisabled();
    expect(revokeButtons[1]).not.toBeDisabled();
  });
});
