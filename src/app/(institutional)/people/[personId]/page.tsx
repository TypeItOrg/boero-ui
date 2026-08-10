import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { Button } from "@common/components/ui/button";
import type { QueryParamValue } from "@common/types/query-param.types";
import { getSafeReturnTo } from "@common/utils/return-to.util";
import { InstitutionalAccessDenied } from "@features/institutional-auth/components/institutional-access-denied";
import { InstitutionalBreadcrumb } from "@features/institutional-auth/components/institutional-breadcrumb";
import { PersonDeleteButton } from "@features/people/components/person-delete-button";
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
  return getInstitutionalMetadata("Editar usuario");
}

export default async function PersonPage({
  params,
  searchParams,
}: {
  params: Promise<{ personId: string }>;
  searchParams: Promise<{ returnTo?: QueryParamValue }>;
}): Promise<React.ReactElement> {
  const { personId } = await params;
  const { returnTo } = await searchParams;
  const destination = getSafeReturnTo(returnTo, "/people");
  const user = await requireInstitutionalUser();
  if (!hasInstitutionalPermission(user, INSTITUTIONAL_PERMISSION.PERSON_READ_ANY)) {
    return <InstitutionalAccessDenied />;
  }
  const canAssignRoles = hasInstitutionalPermission(user, INSTITUTIONAL_PERMISSION.ROLE_ASSIGN);
  const canRevokeRoles = hasInstitutionalPermission(user, INSTITUTIONAL_PERMISSION.ROLE_REVOKE);
  const canManageRoles = canAssignRoles || canRevokeRoles;
  const personPromise = fetchPerson(user.institutionId, personId, PeopleScope.INSTITUTIONAL);
  const rolesPromise: Promise<[PersonRole[], AssignableRole[]]> = canManageRoles
    ? Promise.all([
        fetchPersonRoles(user.institutionId, personId, PeopleScope.INSTITUTIONAL),
        canAssignRoles ? fetchSystemRoles(user.institutionId, PeopleScope.INSTITUTIONAL) : Promise.resolve([]),
      ])
    : Promise.resolve([[], []]);
  const [person, [assignedRoles, systemRoles]] = await Promise.all([personPromise, rolesPromise]);
  if (!person) notFound();
  const assignableRoles = systemRoles.filter((role) => role.technicalCode !== "INSTITUTIONAL_AUTHORITY");
  const personName = `${person.firstName} ${person.lastName}`;
  if (user.personId === personId) redirect("/profile");
  const canUpdate = hasInstitutionalPermission(user, INSTITUTIONAL_PERMISSION.PERSON_UPDATE_ANY);
  const canDelete = hasInstitutionalPermission(user, INSTITUTIONAL_PERMISSION.PERSON_DELETE);
  if (!canUpdate && !canManageRoles) {
    return <InstitutionalAccessDenied />;
  }

  return (
    <PlatformPageShell
      title={canUpdate ? "Editar usuario" : "Administrar roles"}
      description={
        canUpdate
          ? `Editá los datos básicos y administrá los roles de ${personName}.`
          : `Administrá los roles institucionales de ${personName}.`
      }
      breadcrumb={<InstitutionalBreadcrumb segmentLabels={{ [personId]: personName }} />}
      actions={
        canDelete ? (
          <PersonDeleteButton
            institutionId={user.institutionId}
            personId={personId}
            personName={personName}
            scope={PeopleScope.INSTITUTIONAL}
          />
        ) : undefined
      }
    >
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
      <div className="border-border/40 flex items-center justify-end gap-3 border-t pt-5 pb-6">
        <Button asChild variant="outline" size="lg">
          <Link href={destination}>Cancelar</Link>
        </Button>
        <Button type="submit" form="institutional-person-edit-form" size="lg">
          {canUpdate ? "Guardar cambios" : "Guardar roles"}
        </Button>
      </div>
    </PlatformPageShell>
  );
}
