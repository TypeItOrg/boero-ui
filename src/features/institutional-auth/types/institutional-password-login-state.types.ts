export type InstitutionalPasswordLoginActionState = {
  error?: string;
  fieldErrors?: Partial<Record<"password", string>>;
};
