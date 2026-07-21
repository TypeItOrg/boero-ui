import { notFound } from "next/navigation";
import { UserRoundIcon } from "lucide-react";

import type { QueryParamValue } from "@common/types/query-param.types";
import { getSafeReturnTo } from "@common/utils/return-to.util";
import { fetchInstitution } from "@features/institutions/services/fetch-institution.service";
import { PersonForm } from "@features/people/components/person-form";
import { PlatformBreadcrumb } from "@features/platform-auth/components/platform-breadcrumb";
import { PlatformPageShell } from "@features/platform-auth/components/platform-page-shell";

export const metadata = {
  title: "Nuevo usuario",
  description: "Creá un nuevo usuario institucional en la plataforma.",
};

type NewPersonPageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ returnTo?: QueryParamValue }>;
};

export default async function NewPersonPage({ params, searchParams }: NewPersonPageProps): Promise<React.ReactElement> {
  const { id } = await params;
  const { returnTo } = await searchParams;
  const destination = getSafeReturnTo(returnTo, `/admin/institutions/${id}/people`);
  const institution = await fetchInstitution(id);
  if (!institution) notFound();

  return (
    <PlatformPageShell
      title="Nuevo usuario"
      description={`Creá una cuenta institucional para ${institution.name}. El rol inicial será Postulante.`}
      minViewportHeight
      breadcrumb={<PlatformBreadcrumb segmentLabels={{ [id]: institution.name }} />}
      actions={
        <div className="bg-primary text-primary-foreground flex size-14 items-center justify-center rounded-xl">
          <UserRoundIcon className="size-7" />
        </div>
      }
    >
      <PersonForm mode="create" institutionId={id} returnTo={destination} />
    </PlatformPageShell>
  );
}
