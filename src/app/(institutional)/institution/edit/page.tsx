import type { ReactElement } from "react";

import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { Building2Icon } from "lucide-react";

import type { QueryParamValue } from "@common/types/query-param.types";
import { getSafeReturnTo } from "@common/utils/return-to.util";

import { InstitutionalAccessDenied } from "@features/institutional-auth/components/institutional-access-denied";
import { InstitutionalBreadcrumb } from "@features/institutional-auth/components/institutional-breadcrumb";
import { requireInstitutionalUser } from "@features/institutional-auth/services/get-institutional-user.service";
import { INSTITUTIONAL_PERMISSION } from "@features/institutional-auth/types/institutional-permission.types";
import { getInstitutionalMetadata } from "@features/institutional-auth/utils/institutional-metadata.util";
import { hasInstitutionalPermission } from "@features/institutional-auth/utils/institutional-permission.util";
import { InstitutionalInstitutionForm } from "@features/institutions/components/institutional-institution-form";
import { fetchInstitutionalInstitution } from "@features/institutions/services/fetch-institutional-institution.service";
import { PlatformPageIcon } from "@features/platform-auth/components/platform-page-icon";
import { PlatformPageShell } from "@features/platform-auth/components/platform-page-shell";

export async function generateMetadata(): Promise<Metadata> {
  return getInstitutionalMetadata("Editar mi institución");
}

type EditInstitutionalInstitutionPageProps = {
  searchParams: Promise<{ returnTo?: QueryParamValue }>;
};

export default async function EditInstitutionalInstitutionPage({ searchParams }: EditInstitutionalInstitutionPageProps): Promise<ReactElement> {
  const { returnTo } = await searchParams;
  const destination = getSafeReturnTo(returnTo, "/institution");
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
      breadcrumb={<InstitutionalBreadcrumb />}
      minViewportHeight
      headerClassName="flex-row items-center justify-between"
      actionsClassName="self-stretch"
      actions={<PlatformPageIcon icon={Building2Icon} />}
    >
      <InstitutionalInstitutionForm institution={institution} returnTo={destination} />
    </PlatformPageShell>
  );
}
