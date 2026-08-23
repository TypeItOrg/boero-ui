import Link from "next/link";
import { notFound } from "next/navigation";
import { Building2Icon } from "lucide-react";

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
      breadcrumb={<PlatformBreadcrumb segmentLabels={{ [id]: institution.name }} />}
      headerClassName="flex-row items-center justify-between"
      actionsClassName="self-stretch"
      actions={
        <div className="from-primary to-primary/80 text-primary-foreground hidden h-full items-center justify-center rounded-2xl bg-linear-to-br px-4 shadow-xs sm:flex">
          <Building2Icon className="size-6 sm:size-7" aria-hidden="true" />
        </div>
      }
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button asChild variant="outline" size="lg">
          <Link href={destination}>Volver</Link>
        </Button>
        <Button asChild size="lg">
          <Link href={`/admin/institutions/${id}/people`}>Administrar usuarios</Link>
        </Button>
      </div>
      <InstitutionForm mode="edit" institution={institution} returnTo={destination} />
    </PlatformPageShell>
  );
}
