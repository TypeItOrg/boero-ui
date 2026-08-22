import type { ReactNode } from "react";
import { UserRoundIcon } from "lucide-react";

import { InstitutionalBreadcrumb } from "@features/institutional-auth/components/institutional-breadcrumb";
import { requireInstitutionalUser } from "@features/institutional-auth/services/get-institutional-user.service";
import { PlatformPageShell } from "@features/platform-auth/components/platform-page-shell";

export default async function ProfileLayout({ children }: { children: ReactNode }): Promise<React.ReactElement> {
  await requireInstitutionalUser();

  return (
    <PlatformPageShell
      title="Cuenta"
      minViewportHeight
      breadcrumb={<InstitutionalBreadcrumb />}
      headerClassName="flex-row items-center justify-between"
      actionsClassName="self-stretch"
      actions={
        <div className="from-primary to-primary/80 text-primary-foreground hidden h-full items-center justify-center rounded-2xl bg-linear-to-br px-4 shadow-xs sm:flex">
          <UserRoundIcon className="size-6 sm:size-7" aria-hidden="true" />
        </div>
      }
    >
      {children}
    </PlatformPageShell>
  );
}
