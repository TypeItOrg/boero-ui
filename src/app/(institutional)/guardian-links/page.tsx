/* eslint-disable no-restricted-syntax */

import type { Metadata } from "next";

import { UsersIcon } from "lucide-react";

import { GuardianLinkRequests } from "@features/guardian-links/components/guardian-link-requests";
import { fetchInstitutionGuardianLinkRequests } from "@features/guardian-links/services/guardian-link.service";
import { InstitutionalAccessDenied } from "@features/institutional-auth/components/institutional-access-denied";
import { InstitutionalBreadcrumb } from "@features/institutional-auth/components/institutional-breadcrumb";
import { requireInstitutionalUser } from "@features/institutional-auth/services/get-institutional-user.service";
import { canReviewGuardianLinks } from "@features/institutional-auth/utils/institutional-applicant-role.util";
import { getInstitutionalMetadata } from "@features/institutional-auth/utils/institutional-metadata.util";
import { PlatformPageIcon } from "@features/platform-auth/components/platform-page-icon";
import { PlatformPageShell } from "@features/platform-auth/components/platform-page-shell";

export async function generateMetadata(): Promise<Metadata> {
  return getInstitutionalMetadata("Solicitudes de vinculación");
}

export default async function GuardianLinksPage(): Promise<React.ReactElement> {
  const user = await requireInstitutionalUser();

  if (!canReviewGuardianLinks(user)) {
    return <InstitutionalAccessDenied description="No tenés permisos para validar vinculaciones." />;
  }

  const requests = await fetchInstitutionGuardianLinkRequests(user.institutionId);

  return (
    <PlatformPageShell title="Solicitudes de vinculación" breadcrumb={<InstitutionalBreadcrumb />} actions={<PlatformPageIcon icon={UsersIcon} />}>
      <GuardianLinkRequests institutionId={user.institutionId} requests={requests} />
    </PlatformPageShell>
  );
}
