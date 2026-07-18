export type InstitutionalRegisterActionState = {
  error?: string;
  fieldErrors?: Partial<Record<InstitutionalRegisterFieldName, string>>;
};

export type InstitutionalRegisterFieldName =
  | "institutionId"
  | "name"
  | "lastName"
  | "birthDate"
  | "documentNumber"
  | "password"
  | "confirmPassword";

export const INSTITUTIONAL_REGISTER_FIELD_NAMES = [
  "institutionId",
  "name",
  "lastName",
  "birthDate",
  "documentNumber",
  "password",
  "confirmPassword",
] as const;
