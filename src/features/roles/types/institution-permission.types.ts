export type InstitutionPermission = {
  code: string;
  description: string;
  grantable: boolean;
  requiredPermissions: readonly string[];
};
