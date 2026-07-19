export type PeopleScope = "admin" | "institutional";

export function getPeopleApiPrefix(scope: PeopleScope): string {
  return scope === "institutional" ? "/api/v1/institutions" : "/api/v1/admin/institutions";
}

export function getPeoplePath(scope: PeopleScope, institutionId: string, personId?: string): string {
  const path = `${getPeopleApiPrefix(scope)}/${institutionId}/people`;
  return personId ? `${path}/${personId}` : path;
}

export function getRolesPath(scope: PeopleScope, institutionId: string, personId: string): string {
  const prefix = scope === "institutional" ? "/api/v1/institutions" : "/api/v1/admin/institutions";
  return `${prefix}/${institutionId}/people/${personId}/roles`;
}
