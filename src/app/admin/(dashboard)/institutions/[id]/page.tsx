import Link from "next/link";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { GraduationCapIcon, MapPinIcon, UsersIcon } from "lucide-react";

import { Badge } from "@common/components/ui/badge";
import { Button } from "@common/components/ui/button";
import { ReturnToLink } from "@common/components/navigation/return-to-link";
import { InstitutionDetail } from "@features/institutions/components/institution-detail";
import {
  InstitutionPeoplePreview,
  InstitutionPeoplePreviewSkeleton,
} from "@features/institutions/components/institution-people-preview";
import { InstitutionReactivateButton } from "@features/institutions/components/institution-reactivate-button";
import { fetchInstitution } from "@features/institutions/services/fetch-institution.service";
import { PlatformBreadcrumb } from "@features/platform-auth/components/platform-breadcrumb";
import { Metadata } from "next";

type InstitutionDetailPageProps = {
  params: Promise<{ id: string }>;
};

export const metadata: Metadata = {
  title: "Detalle de institución",
};

export default async function InstitutionDetailPage({
  params,
}: InstitutionDetailPageProps): Promise<React.ReactElement> {
  const { id } = await params;
  const institution = await fetchInstitution(id);
  if (!institution) notFound();
  const userCount = Number.isFinite(institution.userCount) ? institution.userCount : 0;

  return (
    <section className="flex max-w-full min-w-0 flex-1 flex-col gap-4 p-3 md:p-4">
      <header className="bg-background flex flex-col gap-4 rounded-xl p-4 shadow-xs sm:p-6 xl:flex-row xl:items-end xl:justify-between">
        <div className="min-w-0">
          <PlatformBreadcrumb segmentLabels={{ [id]: institution.name }} />
          <div className="mt-4 mb-3 flex flex-wrap items-center gap-3">
            <Badge variant={institution.active ? "success" : "destructive"}>
              {institution.active ? "Activa" : "Inactiva"}
            </Badge>
            <span className="text-muted-foreground font-mono text-sm">@{institution.slug}</span>
          </div>
          <h1 className="text-foreground max-w-4xl text-3xl font-bold tracking-tight sm:text-4xl">
            {institution.name}
          </h1>
          <div className="text-muted-foreground mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
            <span className="flex items-center gap-1.5">
              <MapPinIcon className="size-4" />
              {institution.city.name}, {institution.province.name}
            </span>
            <span className="flex items-center gap-1.5">
              <UsersIcon className="size-4" />
              {userCount} usuarios
            </span>
          </div>
        </div>

        <div className="flex shrink-0 flex-wrap items-center gap-3">
          {institution.active ? (
            <>
              <Button asChild variant="outline" size="lg">
                <ReturnToLink href={`/admin/institutions/${id}/edit`}>Editar institución</ReturnToLink>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href={`/admin/institutions/${id}/academic`}>
                  <GraduationCapIcon data-icon="inline-start" />
                  Gestión académica
                </Link>
              </Button>
              <Button asChild size="lg">
                <Link href={`/admin/institutions/${id}/people`}>Administrar usuarios</Link>
              </Button>
            </>
          ) : (
            <InstitutionReactivateButton institutionId={id} institutionName={institution.name} />
          )}
        </div>
      </header>

      <div
        className={
          institution.active
            ? "grid flex-1 items-stretch gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(22rem,28rem)]"
            : "flex flex-1 flex-col"
        }
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
    </section>
  );
}
