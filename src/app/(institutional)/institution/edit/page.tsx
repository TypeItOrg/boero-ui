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
import { InstitutionalInstitutionForm } from "@features/institutions/components/institutional-institution-form";
import { PlatformPageShell } from "@features/platform-auth/components/platform-page-shell";

export async function generateMetadata(): Promise<Metadata> {
  return getInstitutionalMetadata("Editar mi institución");
}

export default async function EditInstitutionalInstitutionPage(): Promise<React.ReactElement> {
  const user = await requireInstitutionalUser();

  if (!hasInstitutionalPermission(user, INSTITUTIONAL_PERMISSION.INSTITUTION_UPDATE)) {
    return <InstitutionalAccessDenied />;
  }

  const institution = await fetchInstitutionalInstitution(user.institutionId);
  if (!institution) {
    notFound();
  }

  return (
    <PlatformPageShell
      title="Editar información"
      description="Actualizá la ubicación y los datos de contacto institucionales."
      breadcrumb={<InstitutionalBreadcrumb />}
      minViewportHeight
      headerClassName="flex-row items-center justify-between"
      actionsClassName="self-stretch"
      actions={
        <div className="from-primary to-primary/80 text-primary-foreground hidden h-full items-center justify-center rounded-2xl bg-linear-to-br px-4 shadow-xs sm:flex">
          <Building2Icon className="size-6 sm:size-7" />
        </div>
      }
    >
      <InstitutionalInstitutionForm institution={institution} returnTo="/institution" />
    </PlatformPageShell>
  );
}
