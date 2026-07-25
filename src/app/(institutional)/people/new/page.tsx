import { UserPlusIcon } from "lucide-react";

import type { QueryParamValue } from "@common/types/query-param.types";
import { getSafeReturnTo } from "@common/utils/return-to.util";
import { InstitutionalAccessDenied } from "@features/institutional-auth/components/institutional-access-denied";
import { InstitutionalBreadcrumb } from "@features/institutional-auth/components/institutional-breadcrumb";
import { PersonForm } from "@features/people/components/person-form";
import { PeopleScope } from "@features/people/utils/people-scope.util";
import { PlatformPageShell } from "@features/platform-auth/components/platform-page-shell";
import { requireInstitutionalUser } from "@features/institutional-auth/services/get-institutional-user.service";
import { INSTITUTIONAL_PERMISSION } from "@features/institutional-auth/types/institutional-permission.types";
import { hasInstitutionalPermission } from "@features/institutional-auth/utils/institutional-permission.util";

import type { Metadata } from "next";
import { getInstitutionalMetadata } from "@features/institutional-auth/utils/institutional-metadata.util";

export async function generateMetadata(): Promise<Metadata> {
  return getInstitutionalMetadata("Nuevo usuario");
}

export default async function NewPersonPage({
  searchParams,
}: {
  searchParams: Promise<{ returnTo?: QueryParamValue }>;
}): Promise<React.ReactElement> {
  const { returnTo } = await searchParams;
  const destination = getSafeReturnTo(returnTo, "/people");
  const user = await requireInstitutionalUser();
  if (!hasInstitutionalPermission(user, INSTITUTIONAL_PERMISSION.PERSON_CREATE)) {
    return <InstitutionalAccessDenied />;
  }

  return (
    <PlatformPageShell
      title="Nuevo usuario"
      description="Creá una cuenta institucional para una persona de tu organización."
      breadcrumb={<InstitutionalBreadcrumb />}
      minViewportHeight
      headerClassName="flex-row items-center justify-between"
      actionsClassName="self-stretch"
      actions={
        <div className="from-primary to-primary/80 text-primary-foreground flex h-full items-center justify-center rounded-2xl bg-linear-to-br px-4 shadow-xs">
          <UserPlusIcon className="size-6 sm:size-7" />
        </div>
      }
    >
      <PersonForm
        mode="create"
        institutionId={user.institutionId}
        scope={PeopleScope.INSTITUTIONAL}
        returnTo={destination}
      />
    </PlatformPageShell>
  );
}
