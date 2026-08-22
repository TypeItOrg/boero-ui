export type InstitutionalPasswordActionState = {
  success?: boolean;
  error?: string;
  fieldErrors?: Partial<Record<"currentPassword" | "password" | "confirmPassword", string>>;
};
