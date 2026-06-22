export type PlatformLoginActionState = {
  error?: string;
  errors?: string[];
  fields?: Array<"email" | "password">;
};
