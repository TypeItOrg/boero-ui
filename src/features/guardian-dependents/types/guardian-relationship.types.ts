export const GUARDIAN_RELATIONSHIP = {
  MOTHER: "MOTHER",
  FATHER: "FATHER",
  LEGAL_GUARDIAN: "LEGAL_GUARDIAN",
  OTHER: "OTHER",
} as const;

export type GuardianRelationship = (typeof GUARDIAN_RELATIONSHIP)[keyof typeof GUARDIAN_RELATIONSHIP];
