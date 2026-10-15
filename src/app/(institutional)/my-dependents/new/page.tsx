import type { ReactElement } from "react";

import type { Metadata } from "next";

import { UserPlusIcon } from "lucide-react";

import type { QueryParamValue } from "@common/types/query-param.types";
import { getSafeReturnTo } from "@common/utils/return-to.util";

import { GuardianDependentForm } from "@features/guardian-dependents/components/guardian-dependent-form";
import { GUARDIAN_DEPENDENTS_PAGE_PATH } from "@features/guardian-dependents/constants/guardian-dependent.constants";
import { InstitutionalAccessDenied } from "@features/institutional-auth/components/institutional-access-denied";
import { InstitutionalBreadcrumb } from "@features/institutional-auth/components/institutional-breadcrumb";
import { requireInstitutionalUser } from "@features/institutional-auth/services/get-institutional-user.service";
import { canManageDependents } from "@features/institutional-auth/utils/institutional-applicant-role.util";
import { getInstitutionalMetadata } from "@features/institutional-auth/utils/institutional-metadata.util";
import { PlatformPageIcon } from "@features/platform-auth/components/platform-page-icon";
import { PlatformPageShell } from "@features/platform-auth/components/platform-page-shell";

export async function generateMetadata(): Promise<Metadata> {
  return getInstitutionalMetadata("Solicitar vinculación");
}

export default async function NewGuardianDependentPage({
  searchParams,
}: {
  searchParams: Promise<{ returnTo?: QueryParamValue }>;
}): Promise<ReactElement> {
  const user = await requireInstitutionalUser();

  if (!canManageDependents(user)) {
    return <InstitutionalAccessDenied description="No tenés permisos para gestionar personas a cargo." />;
  }

  const { returnTo } = await searchParams;

  const destination = getSafeReturnTo(returnTo, GUARDIAN_DEPENDENTS_PAGE_PATH);

  return (
    <PlatformPageShell
      title="Solicitar vinculación"
      breadcrumb={<InstitutionalBreadcrumb segmentLabels={{ new: "Solicitar vinculación" }} segmentHrefs={{ "my-dependents": destination }} />}
      minViewportHeight
      headerClassName="flex-row items-center justify-between"
      actionsClassName="self-stretch"
      actions={<PlatformPageIcon icon={UserPlusIcon} />}
    >
      <GuardianDependentForm institutionId={user.institutionId} returnTo={destination} />
    </PlatformPageShell>
  );
}
