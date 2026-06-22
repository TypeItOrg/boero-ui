export type InstitutionalRegisterActionState = {
  error?: string;
  errors?: string[];
  fields?: Array<"email" | "password">;
};
