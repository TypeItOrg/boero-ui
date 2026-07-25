import { Suspense } from "react";
import { cookies } from "next/headers";

import { InstitutionalShell } from "@features/institutional-auth/components/institutional-shell";
import { InstitutionalRouteSkeleton } from "@features/institutional-auth/components/institutional-route-skeleton";
import { fetchInstitutionalPerson } from "@features/institutional-auth/services/fetch-institutional-person.service";
import { requireInstitutionalUser } from "@features/institutional-auth/services/get-institutional-user.service";

type InstitutionalRouteLayoutProps = {
  children: React.ReactNode;
};

export async function InstitutionalRouteLayout({
  children,
}: InstitutionalRouteLayoutProps): Promise<React.ReactElement> {
  const user = await requireInstitutionalUser();
  const [person, cookieStore] = await Promise.all([fetchInstitutionalPerson(), cookies()]);
  const sidebarOpen = cookieStore.get("institutional-sidebar-open")?.value !== "false";

  return (
    <InstitutionalShell user={user} institutionName={person?.institutionName} defaultSidebarOpen={sidebarOpen}>
      <Suspense fallback={<InstitutionalRouteSkeleton />}>{children}</Suspense>
    </InstitutionalShell>
  );
}
