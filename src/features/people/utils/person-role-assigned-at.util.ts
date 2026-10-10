import { formatRoleAssignedAt } from "@features/people/utils/person-role-date.util";

export function formatAssignedAt(value: string | undefined): string {
  if (!value) {
    return "Asignación pendiente";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return formatRoleAssignedAt(value);
}
