export type ReAuthenticateState = {
  error?: string;
  fieldErrors?: Partial<Record<"password", string>>;
  success?: boolean;
};
