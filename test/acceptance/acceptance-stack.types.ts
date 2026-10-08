import type { AcceptanceTenant } from "./acceptance-tenant.types";

export type AcceptanceStack = {
  publicBase: string;
  apiBase: string;
  mailBase: string;
  admin: { email: string; password: string };
  tenantA: AcceptanceTenant;
  tenantB: AcceptanceTenant;
};
