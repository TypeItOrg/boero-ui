import type { ReactNode } from "react";
import { UserRoundIcon } from "lucide-react";

import { InstitutionalBreadcrumb } from "@features/institutional-auth/components/institutional-breadcrumb";
import { requireInstitutionalUser } from "@features/institutional-auth/services/get-institutional-user.service";
import { PlatformPageShell } from "@features/platform-auth/components/platform-page-shell";
import { PlatformPageIcon } from "@features/platform-auth/components/platform-page-icon";

export default async function ProfileLayout({ children }: { children: ReactNode }): Promise<React.ReactElement> {
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
