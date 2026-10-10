import type { INSTITUTION_LOGO_INTENT } from "@features/institutions/constants/institution-logo.constants";

export type InstitutionLogoChange =
  | { intent: typeof INSTITUTION_LOGO_INTENT.KEEP | typeof INSTITUTION_LOGO_INTENT.REMOVE }
  | { intent: typeof INSTITUTION_LOGO_INTENT.REPLACE; file: File };
