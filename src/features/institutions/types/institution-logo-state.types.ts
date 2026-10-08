export type InstitutionLogoState = {
  success?: boolean;
  error?: string;
  fieldErrors?: Partial<Record<"file", string>>;
  logoUrl?: string | null;
};
