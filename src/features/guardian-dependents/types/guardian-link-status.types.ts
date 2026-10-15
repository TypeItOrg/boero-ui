export const GUARDIAN_LINK_STATUS = {
  PENDING: "PENDING",
  ACTIVE: "ACTIVE",
  REJECTED: "REJECTED",
  ENDED: "ENDED",
} as const;

export type GuardianLinkStatus = (typeof GUARDIAN_LINK_STATUS)[keyof typeof GUARDIAN_LINK_STATUS];
