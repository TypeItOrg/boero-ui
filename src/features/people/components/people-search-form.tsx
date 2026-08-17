"use client";

import { DataTableFilters, type DataTableSelectFilter } from "@common/components/ui/data-table-filters";
import type { AssignableRole } from "@features/people/types/assignable-role.types";

const ALL_ROLES = "all";

type PeopleSearchFormProps = {
  search: string;
  size: number;
  roleId?: string;
  roles?: AssignableRole[];
};

export function PeopleSearchForm({ search, size, roleId, roles = [] }: PeopleSearchFormProps): React.ReactElement {
  const roleFilter: DataTableSelectFilter = {
    defaultValue: ALL_ROLES,
    label: "Rol",
    name: "roleId",
    options: [
      { value: ALL_ROLES, label: "Todos los roles" },
      ...roles.map((role) => ({ value: role.id, label: role.name })),
    ],
    value: roleId ?? ALL_ROLES,
  };

  return (
    <DataTableFilters
      search={search}
      searchPlaceholder="Buscar por nombre, apellido o documento..."
      selectFilters={[roleFilter]}
      size={size}
    />
  );
}
