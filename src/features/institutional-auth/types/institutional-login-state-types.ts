export type InstitutionalLoginActionState = {
  error?: string;
  errors?: string[];
  fields?: Array<"email" | "password">;
};
