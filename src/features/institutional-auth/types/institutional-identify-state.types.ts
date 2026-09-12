export type InstitutionalIdentifyActionState = {
  error?: string;
  fieldErrors?: Partial<Record<"institutionId" | "documentNumber", string>>;
  loginAttemptId?: string;
  nextStep?: "PASSWORD" | "PASSKEY";
};

export const INSTITUTIONAL_IDENTIFY_FIELD_NAMES = ["institutionId", "documentNumber"] as const;
