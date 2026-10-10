import type { ReactElement, ReactNode } from "react";

import { UserRoundIcon } from "lucide-react";

import { InstitutionalBreadcrumb } from "@features/institutional-auth/components/institutional-breadcrumb";
import { requireInstitutionalUser } from "@features/institutional-auth/services/get-institutional-user.service";
import { PlatformPageIcon } from "@features/platform-auth/components/platform-page-icon";
import { PlatformPageShell } from "@features/platform-auth/components/platform-page-shell";

export default async function ProfileLayout({ children }: { children: ReactNode }): Promise<ReactElement> {
  await requireInstitutionalUser();

  return (
    <PlatformPageShell
      title="Cuenta"
      minViewportHeight
      breadcrumb={<InstitutionalBreadcrumb />}
      headerClassName="flex-row items-center justify-between"
      actionsClassName="self-stretch"
      actions={<PlatformPageIcon icon={UserRoundIcon} />}
    >
      {children}
    </PlatformPageShell>
  );
}
