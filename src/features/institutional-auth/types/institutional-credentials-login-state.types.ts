export type InstitutionalCredentialsLoginState = {
  error?: string;
  fieldErrors?: Partial<Record<"institutionId" | "documentNumber" | "password", string>>;
};
