export const PLATFORM_ROLE_TYPE = {
  SYSTEM: "SYSTEM",
  CUSTOM: "CUSTOM",
} as const;

export type PlatformRoleType = (typeof PLATFORM_ROLE_TYPE)[keyof typeof PLATFORM_ROLE_TYPE];
