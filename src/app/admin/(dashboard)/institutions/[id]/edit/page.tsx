import Link from "next/link";
import { notFound } from "next/navigation";

import { Button } from "@common/components/ui/button";
import type { QueryParamValue } from "@common/types/query-param.types";
import { getSafeReturnTo } from "@common/utils/return-to.util";
import { InstitutionForm } from "@features/institutions/components/institution-form";
import { fetchInstitution } from "@features/institutions/services/fetch-institution.service";
import { PlatformBreadcrumb } from "@features/platform-auth/components/platform-breadcrumb";
import { PlatformPageShell } from "@features/platform-auth/components/platform-page-shell";

type EditInstitutionPageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ returnTo?: QueryParamValue }>;
};

export default async function EditInstitutionPage({ params, searchParams }: EditInstitutionPageProps): Promise<React.ReactElement> {
  const { id } = await params;
  const { returnTo } = await searchParams;
  const destination = getSafeReturnTo(returnTo, `/admin/institutions/${id}`);
  const institution = await fetchInstitution(id);
  if (!institution) notFound();

  if (!institution.active) {
    return (
      <PlatformPageShell
        title="Institución inactiva"
        description="Reactivá la institución desde su ficha antes de editar sus datos."
        breadcrumb={<PlatformBreadcrumb segmentLabels={{ [id]: institution.name }} />}
        actions={
          <Button asChild variant="outline" size="lg">
            <Link href={`/admin/institutions/${id}`}>Ver ficha</Link>
          </Button>
        }
      />
    );
  }

  return (
    <PlatformPageShell
      title="Editar institución"
      description={`Editá los datos de ${institution.name}.`}
      breadcrumb={<PlatformBreadcrumb segmentLabels={{ [id]: institution.name }} />}
      actions={
        <Button asChild size="lg">
          <Link href={`/admin/institutions/${id}/people`}>Administrar usuarios</Link>
        </Button>
      }
    >
      <InstitutionForm mode="edit" institution={institution} returnTo={destination} />
    </PlatformPageShell>
  );
}
