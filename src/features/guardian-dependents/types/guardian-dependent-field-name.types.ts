export type GuardianDependentFieldName = "documentNumber" | "firstName" | "lastName" | "birthDate" | "relationship" | "isPrimaryContact";

export const GUARDIAN_DEPENDENT_FIELD_NAMES = [
  "documentNumber",
  "firstName",
  "lastName",
  "birthDate",
  "relationship",
  "isPrimaryContact",
] as const satisfies readonly GuardianDependentFieldName[];
