import Link from "next/link";
import { notFound } from "next/navigation";

import { Button } from "@common/components/ui/button";
import { PersonDeleteButton } from "@features/people/components/person-delete-button";
import { PersonEditForm } from "@features/people/components/person-edit-form";
import { fetchPerson } from "@features/people/services/fetch-person.service";
import { fetchPersonRoles } from "@features/people/services/fetch-person-roles.service";
import { fetchSystemRolesWithFallback } from "@features/people/services/fetch-system-roles.service";
import { PlatformBreadcrumb } from "@features/platform-auth/components/platform-breadcrumb";
import { PlatformPageShell } from "@features/platform-auth/components/platform-page-shell";

type EditPersonPageProps = {
  params: Promise<{ id: string; personId: string }>;
};

export default async function EditPersonPage({ params }: EditPersonPageProps): Promise<React.ReactElement> {
  const { id, personId } = await params;
  const [person, assignedRoles, systemRoles] = await Promise.all([
    fetchPerson(id, personId),
    fetchPersonRoles(id, personId),
    fetchSystemRolesWithFallback(),
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
        roles={systemRoles.roles}
        assignedRoles={assignedRoles}
      />

      <div className="border-border/40 flex items-center justify-end gap-3 border-t pt-5 pb-6">
        <Button asChild variant="outline">
          <Link href={`/admin/institutions/${id}/people`}>Cancelar</Link>
        </Button>
        <Button type="submit" form="person-edit-form">
          Guardar cambios
        </Button>
      </div>
    </PlatformPageShell>
  );
}
