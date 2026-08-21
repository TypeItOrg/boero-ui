import Link from "next/link";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { Building2Icon } from "lucide-react";

import { Badge } from "@common/components/ui/badge";
import { Button } from "@common/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@common/components/ui/card";
import type { QueryParamValue } from "@common/types/query-param.types";
import { ReturnToLink } from "@common/components/navigation/return-to-link";
import { getSafeReturnTo } from "@common/utils/return-to.util";
import { InstitutionDetail } from "@features/institutions/components/institution-detail";
import { InstitutionPeoplePreview, InstitutionPeoplePreviewSkeleton } from "@features/institutions/components/institution-people-preview";
import { InstitutionReactivateButton } from "@features/institutions/components/institution-reactivate-button";
import { fetchInstitution } from "@features/institutions/services/fetch-institution.service";
import { PlatformBreadcrumb } from "@features/platform-auth/components/platform-breadcrumb";
import { Metadata } from "next";

type InstitutionDetailPageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ returnTo?: QueryParamValue }>;
};

export const metadata: Metadata = {
  title: "Detalle de institución",
};

export default async function InstitutionDetailPage({ params, searchParams }: InstitutionDetailPageProps): Promise<React.ReactElement> {
  const [{ id }, { returnTo }] = await Promise.all([params, searchParams]);
  const destination = getSafeReturnTo(returnTo, "/admin/institutions");
  const institution = await fetchInstitution(id);
  if (!institution) notFound();
  const userCount = Number.isFinite(institution.userCount) ? institution.userCount : 0;

  return (
    <section className="flex max-w-full min-w-0 flex-1 flex-col gap-4 p-3 md:p-4">
      <header className="bg-background flex min-w-0 flex-row items-center justify-between gap-4 rounded-xl p-4 shadow-xs sm:p-6">
        <div className="min-w-0">
          <PlatformBreadcrumb segmentLabels={{ [id]: institution.name }} />
          <h1 className="text-foreground mt-4 max-w-4xl text-3xl font-bold tracking-tight sm:text-4xl">{institution.name}</h1>
        </div>
        <div className="from-primary to-primary/80 text-primary-foreground hidden h-full min-h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-linear-to-br shadow-xs sm:flex">
          <Building2Icon className="size-6 sm:size-7" aria-hidden="true" />
        </div>
      </header>

      <div className="bg-background flex min-w-0 flex-1 flex-col gap-4 rounded-xl p-4 shadow-xs sm:p-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <Button asChild variant="outline" size="lg" className="self-start">
            <Link href={destination}>Volver</Link>
          </Button>
          {institution.active ? (
            <div className="flex w-full flex-wrap justify-start gap-3 md:w-auto md:flex-nowrap md:justify-end">
              <Button asChild variant="outline" size="lg" className="flex-1 md:flex-none">
                <Link href={`/admin/institutions/${id}/people`}>Administrar usuarios</Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="flex-1 md:flex-none">
                <Link href={`/admin/institutions/${id}/academic`}>Gestión académica</Link>
              </Button>
              <Button asChild size="lg" className="w-full sm:w-auto sm:flex-1 md:flex-none">
                <ReturnToLink href={`/admin/institutions/${id}/edit`} returnTo={destination}>
                  Editar institución
                </ReturnToLink>
              </Button>
            </div>
          ) : (
            <InstitutionReactivateButton institutionId={id} institutionName={institution.name} />
          )}
        </div>

        <Card className="bg-muted/25 gap-0 p-5 sm:p-6">
          <CardHeader className="-mx-5 border-b px-5 pb-5 sm:-mx-6 sm:px-6">
            <div className="flex items-stretch gap-3.5">
              <div className="bg-primary/10 text-primary flex aspect-square min-h-11 min-w-11 shrink-0 items-center justify-center self-stretch rounded-xl">
                <Building2Icon className="size-5" aria-hidden="true" />
              </div>
              <div className="flex min-w-0 flex-col justify-center">
                <CardTitle>Información institucional</CardTitle>
                <CardDescription>Datos principales de identificación y actividad.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="mt-5 p-0">
            <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <dt className="text-muted-foreground text-xs font-medium tracking-wider uppercase">Estado</dt>
                <dd className="mt-1.5">
                  <Badge variant={institution.active ? "success" : "destructive"}>{institution.active ? "Activa" : "Inactiva"}</Badge>
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground text-xs font-medium tracking-wider uppercase">Slug</dt>
                <dd className="text-foreground mt-1.5 font-mono text-sm">@{institution.slug}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground text-xs font-medium tracking-wider uppercase">Ubicación</dt>
                <dd className="text-foreground mt-1.5 text-sm font-medium">
                  {institution.city.name}, {institution.province.name}
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground text-xs font-medium tracking-wider uppercase">Usuarios</dt>
                <dd className="text-foreground mt-1.5 text-sm font-medium">{userCount}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        <div
          className={institution.active ? "grid flex-1 items-start gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(22rem,28rem)]" : "flex flex-1 flex-col"}
        >
          <InstitutionDetail institution={institution} />

          {institution.active && (
            <div className="self-start">
              <Suspense fallback={<InstitutionPeoplePreviewSkeleton />}>
                <InstitutionPeoplePreview institutionId={id} />
              </Suspense>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
