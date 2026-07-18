export type InstitutionalLoginActionState = {
  error?: string;
  fieldErrors?: Partial<Record<"institutionId" | "documentNumber" | "password", string>>;
};

export const INSTITUTIONAL_LOGIN_FIELD_NAMES = ["institutionId", "documentNumber", "password"] as const;
