export type GuardianDependentFieldName =
  "documentNumber" | "firstName" | "lastName" | "birthDate" | "relationship" | "isPrimaryContact" | "documents";

export const GUARDIAN_DEPENDENT_FIELD_NAMES = [
  "documentNumber",
  "firstName",
  "lastName",
  "birthDate",
  "relationship",
  "isPrimaryContact",
  "documents",
] as const satisfies readonly GuardianDependentFieldName[];
