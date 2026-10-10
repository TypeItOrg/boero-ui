import type { Metadata } from "next";
import { UsersIcon } from "lucide-react";

import { GuardianLinkRequests } from "@features/guardian-links/components/guardian-link-requests";
import { resolvePlatformGuardianLinkAction } from "@features/guardian-links/actions/resolve-platform-guardian-link.action";
import { fetchAllPlatformGuardianLinkRequests } from "@features/guardian-links/services/platform-guardian-link.service";
import { PlatformBreadcrumb } from "@features/platform-auth/components/platform-breadcrumb";
import { PlatformPageIcon } from "@features/platform-auth/components/platform-page-icon";
import { PlatformPageShell } from "@features/platform-auth/components/platform-page-shell";

export const metadata: Metadata = { title: "Solicitudes de vinculación" };

export default async function PlatformGuardianLinksPage(): Promise<React.ReactElement> {
  const requests = await fetchAllPlatformGuardianLinkRequests();

  return (
    <PlatformPageShell title="Solicitudes de vinculación" breadcrumb={<PlatformBreadcrumb />} actions={<PlatformPageIcon icon={UsersIcon} />}>
      <GuardianLinkRequests attachmentPathMode="platform" onResolve={resolvePlatformGuardianLinkAction} requests={requests} showInstitution />
    </PlatformPageShell>
  );
}
