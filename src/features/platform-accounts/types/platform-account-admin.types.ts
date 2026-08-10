import type { PlatformAccountRoleCode } from "@features/platform-accounts/types/platform-account-role-code.types";

export type PlatformAccountAdmin = {
  platformAccountId: string;
  name: string;
  lastName: string;
  email: string;
  enabled: boolean;
  createdAt: string;
  roleCode: PlatformAccountRoleCode;
  roleName: string;
};
