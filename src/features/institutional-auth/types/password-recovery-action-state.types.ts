export type PasswordRecoveryActionState = {
  error?: string;
  fieldErrors?: Partial<Record<"institutionId" | "documentNumber", string>>;
  success?: boolean;
};


