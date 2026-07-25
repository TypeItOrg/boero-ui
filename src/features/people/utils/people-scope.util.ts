export type PeopleScope = "admin" | "institutional";

export const PeopleScope = {
  ADMIN: "admin",
  INSTITUTIONAL: "institutional",

  isAdmin(scope: PeopleScope): boolean {
    return scope === PeopleScope.ADMIN;
  },

  isInstitutional(scope: PeopleScope): boolean {
    return scope === PeopleScope.INSTITUTIONAL;
  },
} as const;

export function getPeopleApiPrefix(scope: PeopleScope): string {
  return PeopleScope.isInstitutional(scope) ? "/api/v1/institutions" : "/api/v1/admin/institutions";
}

export function getPeoplePath(scope: PeopleScope, institutionId: string, personId?: string): string {
  const path = `${getPeopleApiPrefix(scope)}/${institutionId}/people`;
  return personId ? `${path}/${personId}` : path;
}

export function getRolesPath(scope: PeopleScope, institutionId: string, personId: string): string {
  const prefix = PeopleScope.isInstitutional(scope) ? "/api/v1/institutions" : "/api/v1/admin/institutions";
  return `${prefix}/${institutionId}/people/${personId}/roles`;
}
