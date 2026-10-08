import type { ReactElement } from "react";

import type { Metadata } from "next";

import { UserPlusIcon } from "lucide-react";

import type { QueryParamValue } from "@common/types/query-param.types";
import { getSafeReturnTo } from "@common/utils/return-to.util";

import { InstitutionalAccessDenied } from "@features/institutional-auth/components/institutional-access-denied";
import { InstitutionalBreadcrumb } from "@features/institutional-auth/components/institutional-breadcrumb";
import { requireInstitutionalUser } from "@features/institutional-auth/services/get-institutional-user.service";
import { INSTITUTIONAL_PERMISSION } from "@features/institutional-auth/types/institutional-permission.types";
import { getInstitutionalMetadata } from "@features/institutional-auth/utils/institutional-metadata.util";
import { hasInstitutionalPermission } from "@features/institutional-auth/utils/institutional-permission.util";
import { PersonForm } from "@features/people/components/person-form";
import { PeopleScope } from "@features/people/utils/people-scope.util";
import { PlatformPageIcon } from "@features/platform-auth/components/platform-page-icon";
import { PlatformPageShell } from "@features/platform-auth/components/platform-page-shell";

export async function generateMetadata(): Promise<Metadata> {
  return getInstitutionalMetadata("Nuevo usuario");
}

export default async function NewPersonPage({ searchParams }: { searchParams: Promise<{ returnTo?: QueryParamValue }> }): Promise<ReactElement> {
  const { returnTo } = await searchParams;

  const destination = getSafeReturnTo(returnTo, "/people");

  const user = await requireInstitutionalUser();

  if (!hasInstitutionalPermission(user, INSTITUTIONAL_PERMISSION.PERSON_CREATE)) {
    return <InstitutionalAccessDenied />;
  }

  return (
    <PlatformPageShell
      title="Nuevo usuario"
      breadcrumb={<InstitutionalBreadcrumb />}
      minViewportHeight
      headerClassName="flex-row items-center justify-between"
      actionsClassName="self-stretch"
      actions={<PlatformPageIcon icon={UserPlusIcon} />}
    >
      <PersonForm mode="create" institutionId={user.institutionId} scope={PeopleScope.INSTITUTIONAL} returnTo={destination} />
    </PlatformPageShell>
  );
}
