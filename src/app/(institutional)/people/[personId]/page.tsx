import Link from "next/link";
import { notFound } from "next/navigation";
import { UserRoundPenIcon } from "lucide-react";

import { Button } from "@common/components/ui/button";
import type { QueryParamValue } from "@common/types/query-param.types";
import { getSafeReturnTo } from "@common/utils/return-to.util";
import { InstitutionalAccessDenied } from "@features/institutional-auth/components/institutional-access-denied";
import { InstitutionalBreadcrumb } from "@features/institutional-auth/components/institutional-breadcrumb";
import { PersonDeleteButton } from "@features/people/components/person-delete-button";
import { PersonDetailView } from "@features/people/components/person-detail-view";
import { PersonEditForm } from "@features/people/components/person-edit-form";
import { fetchPerson } from "@features/people/services/fetch-person.service";
import { fetchPersonRoles } from "@features/people/services/fetch-person-roles.service";
import { fetchSystemRoles } from "@features/people/services/fetch-system-roles.service";
import { PeopleScope } from "@features/people/utils/people-scope.util";
import type { AssignableRole } from "@features/people/types/assignable-role.types";
import type { PersonRole } from "@features/people/types/person-role.types";
import { requireInstitutionalUser } from "@features/institutional-auth/services/get-institutional-user.service";
import { INSTITUTIONAL_PERMISSION } from "@features/institutional-auth/types/institutional-permission.types";
import { hasInstitutionalPermission } from "@features/institutional-auth/utils/institutional-permission.util";
import { PlatformPageShell } from "@features/platform-auth/components/platform-page-shell";

import type { Metadata } from "next";
import { getInstitutionalMetadata } from "@features/institutional-auth/utils/institutional-metadata.util";

export async function generateMetadata(): Promise<Metadata> {
  return getInstitutionalMetadata("Detalle de usuario");
}

export default async function PersonPage({
  params,
  searchParams,
}: {
  params: Promise<{ personId: string }>;
  searchParams: Promise<{ returnTo?: QueryParamValue; view?: QueryParamValue }>;
}): Promise<React.ReactElement> {
  const { personId } = await params;
  const { returnTo, view } = await searchParams;
  const destination = getSafeReturnTo(returnTo, "/people");
  const isDetailView = view === "detail";
  const user = await requireInstitutionalUser();
  if (!hasInstitutionalPermission(user, INSTITUTIONAL_PERMISSION.PERSON_READ_ANY)) {
    return <InstitutionalAccessDenied />;
  }
  const canAssignRoles = hasInstitutionalPermission(user, INSTITUTIONAL_PERMISSION.ROLE_ASSIGN);
  const canRevokeRoles = hasInstitutionalPermission(user, INSTITUTIONAL_PERMISSION.ROLE_REVOKE);
  const canManageRoles = canAssignRoles || canRevokeRoles;
  const personPromise = fetchPerson(user.institutionId, personId, PeopleScope.INSTITUTIONAL);
  const rolesPromise: Promise<[PersonRole[], AssignableRole[]]> = isDetailView
    ? fetchPersonRoles(user.institutionId, personId, PeopleScope.INSTITUTIONAL).then((assignedRoles) => [assignedRoles, []])
    : canManageRoles
      ? Promise.all([
          fetchPersonRoles(user.institutionId, personId, PeopleScope.INSTITUTIONAL),
          canAssignRoles ? fetchSystemRoles(user.institutionId, PeopleScope.INSTITUTIONAL) : Promise.resolve([]),
        ])
      : Promise.resolve([[], []]);
  const [person, [assignedRoles, systemRoles]] = await Promise.all([personPromise, rolesPromise]);
  if (!person) notFound();
  const assignableRoles = systemRoles.filter((role) => role.technicalCode !== "INSTITUTIONAL_AUTHORITY");
  const personName = `${person.firstName} ${person.lastName}`;
  const canUpdate = hasInstitutionalPermission(user, INSTITUTIONAL_PERMISSION.PERSON_UPDATE_ANY);
  const canDelete = hasInstitutionalPermission(user, INSTITUTIONAL_PERMISSION.PERSON_DELETE) && user.personId !== personId;
  return (
    <PlatformPageShell
      title={isDetailView ? "Detalle de usuario" : canUpdate ? "Editar usuario" : "Administrar roles"}
      minViewportHeight
      breadcrumb={<InstitutionalBreadcrumb segmentLabels={{ [personId]: personName }} />}
      headerClassName="flex-row items-center justify-between"
      actionsClassName="self-stretch"
      actions={
        <div className="from-primary to-primary/80 text-primary-foreground hidden h-full items-center justify-center rounded-2xl bg-linear-to-br px-4 shadow-xs sm:flex">
          <UserRoundPenIcon className="size-6 sm:size-7" />
        </div>
      }
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button asChild variant="outline" size="lg">
          <Link href={destination}>Volver</Link>
        </Button>
        {canDelete && !isDetailView ? (
          <PersonDeleteButton institutionId={user.institutionId} personId={personId} personName={personName} scope={PeopleScope.INSTITUTIONAL} />
        ) : null}
      </div>
      {isDetailView ? (
        <PersonDetailView person={person} assignedRoles={assignedRoles} />
      ) : (
        <PersonEditForm
          formId="institutional-person-edit-form"
          institutionId={user.institutionId}
          person={person}
          roles={assignableRoles}
          assignedRoles={assignedRoles}
          scope={PeopleScope.INSTITUTIONAL}
          canEdit={canUpdate}
          canAssignRoles={canAssignRoles}
          canRevokeRoles={canRevokeRoles}
          returnTo={destination}
        />
      )}
    </PlatformPageShell>
  );
}
