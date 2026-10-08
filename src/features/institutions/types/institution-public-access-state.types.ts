export type InstitutionPublicAccessState = {
  success?: boolean;
  error?: string;
  fieldErrors?: Partial<Record<"publicSubdomain", string>>;
};
