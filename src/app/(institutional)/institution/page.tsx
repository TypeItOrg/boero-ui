import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Building2Icon } from "lucide-react";

import { InstitutionalAccessDenied } from "@features/institutional-auth/components/institutional-access-denied";
import { InstitutionalBreadcrumb } from "@features/institutional-auth/components/institutional-breadcrumb";
import { requireInstitutionalUser } from "@features/institutional-auth/services/get-institutional-user.service";
import { INSTITUTIONAL_PERMISSION } from "@features/institutional-auth/types/institutional-permission.types";
import { hasInstitutionalPermission } from "@features/institutional-auth/utils/institutional-permission.util";
import { getInstitutionalMetadata } from "@features/institutional-auth/utils/institutional-metadata.util";
import { fetchInstitutionalInstitution } from "@features/institutions/services/fetch-institutional-institution.service";
import { InstitutionalInstitutionDetail } from "@features/institutions/components/institutional-institution-detail";
import { PlatformPageShell } from "@features/platform-auth/components/platform-page-shell";

export async function generateMetadata(): Promise<Metadata> {
  return getInstitutionalMetadata("Mi institución");
}

export default async function InstitutionalInstitutionPage(): Promise<React.ReactElement> {
  const user = await requireInstitutionalUser();

  if (!hasInstitutionalPermission(user, INSTITUTIONAL_PERMISSION.INSTITUTION_READ)) {
    return <InstitutionalAccessDenied />;
  }

  const institution = await fetchInstitutionalInstitution(user.institutionId);
  if (!institution) {
    notFound();
  }

  const canUpdate = hasInstitutionalPermission(user, INSTITUTIONAL_PERMISSION.INSTITUTION_UPDATE);

  return (
    <PlatformPageShell
      title={institution.name}
      breadcrumb={<InstitutionalBreadcrumb />}
      minViewportHeight
      headerClassName="flex-row items-center justify-between"
      actionsClassName="self-stretch"
      actions={
        <div className="from-primary to-primary/80 text-primary-foreground flex h-full items-center justify-center rounded-2xl bg-linear-to-br px-4 shadow-xs">
          <Building2Icon className="size-6 sm:size-7" aria-hidden="true" />
        </div>
      }
    >
      <InstitutionalInstitutionDetail canUpdate={canUpdate} institution={institution} />
    </PlatformPageShell>
  );
}
