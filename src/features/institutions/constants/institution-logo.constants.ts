export const INSTITUTION_LOGO_MIME_TYPES = ["image/png", "image/jpeg"] as const;

export const MAX_INSTITUTION_LOGO_BYTES = 2 * 1024 * 1024;

export const INSTITUTION_LOGO_INTENT = {
  KEEP: "keep",
  REMOVE: "remove",
  REPLACE: "replace",
} as const;

export const INSTITUTION_LOGO_API_INTENT = {
  [INSTITUTION_LOGO_INTENT.KEEP]: "KEEP",
  [INSTITUTION_LOGO_INTENT.REMOVE]: "REMOVE",
  [INSTITUTION_LOGO_INTENT.REPLACE]: "REPLACE",
} as const;
