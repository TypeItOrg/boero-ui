export type InstitutionPermission = {
  code: string;
  description: string;
  grantable: boolean;
  supportsTrainingPaths?: boolean;
  requiredPermissions: readonly string[];
};
