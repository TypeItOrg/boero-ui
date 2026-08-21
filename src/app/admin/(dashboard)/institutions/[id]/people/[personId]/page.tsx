import Link from "next/link";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import { UserRoundPenIcon } from "lucide-react";

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

export default async function EditPersonPage({ params, searchParams }: EditPersonPageProps): Promise<React.ReactElement> {
  const { id, personId } = await params;
  const { returnTo } = await searchParams;
  const destination = getSafeReturnTo(returnTo, `/admin/institutions/${id}/people`);
  const [person, assignedRoles, systemRoles] = await Promise.all([fetchPerson(id, personId), fetchPersonRoles(id, personId), fetchSystemRoles(id)]);
  if (!person) notFound();
  const personName = `${person.firstName} ${person.lastName}`;

  return (
    <PlatformPageShell
      title="Editar usuario"
      minViewportHeight
      breadcrumb={<PlatformBreadcrumb segmentLabels={{ [id]: person.institutionName, [personId]: personName }} />}
      headerClassName="flex-row items-center justify-between"
      actionsClassName="self-stretch"
      actions={
        <div className="from-primary to-primary/80 text-primary-foreground hidden h-full items-center justify-center rounded-2xl bg-linear-to-br px-4 shadow-xs sm:flex">
          <UserRoundPenIcon className="size-6 sm:size-7" />
        </div>
      }
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button asChild variant="outline">
          <Link href={destination}>Volver</Link>
        </Button>
        <PersonDeleteButton institutionId={id} personId={personId} personName={personName} />
      </div>

      <PersonEditForm
        formId="person-edit-form"
        institutionId={id}
        person={person}
        roles={systemRoles}
        assignedRoles={assignedRoles}
        returnTo={destination}
      />
    </PlatformPageShell>
  );
}
