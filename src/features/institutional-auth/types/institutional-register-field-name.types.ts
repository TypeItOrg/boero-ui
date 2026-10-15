export type InstitutionalRegisterFieldName =
  "institutionId" | "name" | "lastName" | "birthDate" | "documentNumber" | "email" | "isGuardian" | "password" | "confirmPassword";

export const INSTITUTIONAL_REGISTER_FIELD_NAMES = [
  "institutionId",
  "name",
  "lastName",
  "birthDate",
  "documentNumber",
  "email",
  "isGuardian",
  "password",
  "confirmPassword",
] as const satisfies readonly InstitutionalRegisterFieldName[];
