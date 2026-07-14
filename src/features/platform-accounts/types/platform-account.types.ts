export type PlatformAccountRoleCode = "PLATFORM_ADMIN";

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
