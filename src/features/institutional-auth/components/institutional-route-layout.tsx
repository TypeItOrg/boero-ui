import { cookies } from "next/headers";

import { InstitutionalShell } from "@features/institutional-auth/components/institutional-shell";
import { InstitutionalUserProvider } from "@features/institutional-auth/components/institutional-user-provider";
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
    <InstitutionalUserProvider initialUser={user}>
      <InstitutionalShell user={user} institutionName={person?.institutionName} defaultSidebarOpen={sidebarOpen}>
        {children}
      </InstitutionalShell>
    </InstitutionalUserProvider>
  );
}
