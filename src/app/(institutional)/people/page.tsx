import type { Metadata } from "next";
import { Suspense } from "react";
import { PlusIcon } from "lucide-react";

import { ReturnToLink } from "@common/components/navigation/return-to-link";
import { Button } from "@common/components/ui/button";
import { DataTableNavigationProvider } from "@common/components/ui/data-table-navigation";
import { InstitutionalAccessDenied } from "@features/institutional-auth/components/institutional-access-denied";
import { InstitutionalBreadcrumb } from "@features/institutional-auth/components/institutional-breadcrumb";
import { requireInstitutionalUser } from "@features/institutional-auth/services/get-institutional-user.service";
import { INSTITUTIONAL_PERMISSION } from "@features/institutional-auth/types/institutional-permission.types";
import { getInstitutionalMetadata } from "@features/institutional-auth/utils/institutional-metadata.util";
import { hasInstitutionalPermission } from "@features/institutional-auth/utils/institutional-permission.util";
import { PeopleSearchForm } from "@features/people/components/people-search-form";
import { PeopleTableContainer } from "@features/people/components/people-table-container";
import { PeopleTableSkeleton } from "@features/people/components/people-table-skeleton";
import { fetchPeople } from "@features/people/services/fetch-people.service";
import { fetchSystemRoles } from "@features/people/services/fetch-system-roles.service";
import { parsePeoplePaginationParams, type PeopleSearchParams } from "@features/people/utils/people-pagination.util";
import { PlatformPageShell } from "@features/platform-auth/components/platform-page-shell";

export async function generateMetadata(): Promise<Metadata> {
  return getInstitutionalMetadata("Usuarios");
}

export default async function PeoplePage({
  searchParams,
}: {
  searchParams: Promise<PeopleSearchParams>;
}): Promise<React.ReactElement> {
  const user = await requireInstitutionalUser();

  if (!hasInstitutionalPermission(user, INSTITUTIONAL_PERMISSION.PERSON_READ_ANY)) {
    return <InstitutionalAccessDenied description="No tenés permisos para gestionar usuarios de esta institución." />;
  }

  const resolvedSearchParams = await searchParams;
  const { page, size, search, sort, roleId } = parsePeoplePaginationParams(resolvedSearchParams);
  const rolesPromise = fetchSystemRoles(user.institutionId, "institutional");
  const peoplePromise = fetchPeople(user.institutionId, { page, size, search, sort, roleId }, "institutional");
  const [roles, canCreate, canUpdate, canManageRoles] = await Promise.all([
    rolesPromise,
    hasInstitutionalPermission(user, INSTITUTIONAL_PERMISSION.PERSON_CREATE),
    hasInstitutionalPermission(user, INSTITUTIONAL_PERMISSION.PERSON_UPDATE_ANY),
    hasInstitutionalPermission(user, INSTITUTIONAL_PERMISSION.ROLE_ASSIGN) ||
      hasInstitutionalPermission(user, INSTITUTIONAL_PERMISSION.ROLE_REVOKE),
  ]);

  return (
    <PlatformPageShell
      title="Usuarios"
      description="Consultá y administrá las personas de tu institución."
      breadcrumb={<InstitutionalBreadcrumb />}
      actions={
        canCreate ? (
          <Button asChild size="lg" className="w-full">
            <ReturnToLink href="/people/new">
              <PlusIcon data-icon="inline-start" />
              Nuevo usuario
            </ReturnToLink>
          </Button>
        ) : undefined
      }
    >
      <DataTableNavigationProvider>
        <PeopleSearchForm search={search} size={size} roleId={roleId} roles={roles} />
        <Suspense fallback={<PeopleTableSkeleton />}>
          <PeopleTableContainer
            institutionId={user.institutionId}
            page={page}
            size={size}
            search={search}
            sort={sort}
            roleId={roleId}
            scope="institutional"
            dataPromise={peoplePromise}
            selfPersonId={user.personId}
            canCreate={canCreate}
            canUpdate={canUpdate}
            canManageRoles={canManageRoles}
            canDelete={hasInstitutionalPermission(user, INSTITUTIONAL_PERMISSION.PERSON_DELETE)}
            canUpdateStatus={hasInstitutionalPermission(user, INSTITUTIONAL_PERMISSION.USER_STATUS_UPDATE)}
          />
        </Suspense>
      </DataTableNavigationProvider>
    </PlatformPageShell>
  );
}
