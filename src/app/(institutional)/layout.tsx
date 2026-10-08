import type { ReactElement, ReactNode } from "react";

import { InstitutionalRouteLayout } from "@features/institutional-auth/components/institutional-route-layout";

export default async function InstitutionalLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>): Promise<ReactElement> {
  return <InstitutionalRouteLayout>{children}</InstitutionalRouteLayout>;
}
