import Link from "next/link";
import { notFound } from "next/navigation";
import { Metadata } from "next";

import { Button } from "@common/components/ui/button";
import type { QueryParamValue } from "@common/types/query-param.types";
import { getSafeReturnTo } from "@common/utils/return-to.util";
import { PersonDeleteButton } from "@features/people/components/person-delete-button";
import { PersonEditForm } from "@features/people/components/person-edit-form";
import { fetchPerson } from "@features/people/services/fetch-person.service";
import { fetchPersonRoles } from "@features/people/services/fetch-person-roles.service";
import { fetchSystemRoles } from "@features/people/services/fetch-system-roles.service";
import { PlatformBreadcrumb } from "@features/platform-auth/components/platform-breadcrumb";
import { PlatformPageShell } from "@features/platform-auth/components/platform-page-shell";

type EditPersonPageProps = {
  params: Promise<{ id: string; personId: string }>;
  searchParams: Promise<{ returnTo?: QueryParamValue }>;
};

export const metadata: Metadata = {
  title: "Editar usuario",
};

export default async function EditPersonPage({
  params,
  searchParams,
}: EditPersonPageProps): Promise<React.ReactElement> {
  const { id, personId } = await params;
  const { returnTo } = await searchParams;
  const destination = getSafeReturnTo(returnTo, `/admin/institutions/${id}/people`);
  const [person, assignedRoles, systemRoles] = await Promise.all([
    fetchPerson(id, personId),
    fetchPersonRoles(id, personId),
    fetchSystemRoles(id),
  ]);
  if (!person) notFound();
  const personName = `${person.firstName} ${person.lastName}`;

  return (
    <PlatformPageShell
      title="Editar usuario"
      description={`Editá los datos básicos y administrá los roles de ${personName}.`}
      breadcrumb={<PlatformBreadcrumb segmentLabels={{ [id]: person.institutionName, [personId]: personName }} />}
      actions={<PersonDeleteButton institutionId={id} personId={personId} personName={personName} />}
    >
      <PersonEditForm
        formId="person-edit-form"
        institutionId={id}
        person={person}
        roles={systemRoles}
        assignedRoles={assignedRoles}
        returnTo={destination}
      />

      <div className="border-border/40 flex items-center justify-end gap-3 border-t pt-5 pb-6">
        <Button asChild variant="outline">
          <Link href={destination}>Cancelar</Link>
        </Button>
        <Button type="submit" form="person-edit-form">
          Guardar cambios
        </Button>
      </div>
    </PlatformPageShell>
  );
}
