import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MapPinIcon, UsersIcon } from "lucide-react";

import { Badge } from "@common/components/ui/badge";
import { Button } from "@common/components/ui/button";
import { isHttpStatusError } from "@common/utils/create-http-error.util";
import { InstitutionDetail } from "@features/institutions/components/institution-detail";
import {
  InstitutionPeoplePreview,
  InstitutionPeoplePreviewSkeleton,
} from "@features/institutions/components/institution-people-preview";
import { InstitutionReactivateButton } from "@features/institutions/components/institution-reactivate-button";
import { fetchInstitution } from "@features/institutions/services/fetch-institution.service";
import { PlatformBreadcrumb } from "@features/platform-auth/components/platform-breadcrumb";

type InstitutionDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function InstitutionDetailPage({
  params,
}: InstitutionDetailPageProps): Promise<React.ReactElement> {
  const { id } = await params;
  const institution = await getInstitutionOrNotFound(id);
  const userCount = Number.isFinite(institution.userCount) ? institution.userCount : 0;

  return (
    <section className="flex max-w-full min-w-0 flex-col gap-4 p-4">
      <header className="bg-background flex flex-col gap-5 rounded-xl p-5 shadow-xs sm:p-6 xl:flex-row xl:items-end xl:justify-between">
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
                <Link href={`/platform/institutions/${id}/edit`}>Editar institución</Link>
              </Button>
              <Button asChild size="lg">
                <Link href={`/platform/institutions/${id}/people`}>Administrar usuarios</Link>
              </Button>
            </>
          ) : (
            <InstitutionReactivateButton institutionId={id} institutionName={institution.name} />
          )}
        </div>
      </header>

      <div
        className={
          institution.active ? "grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(22rem,28rem)]" : undefined
        }
      >
        <InstitutionDetail institution={institution} />

        {institution.active && (
          <Suspense fallback={<InstitutionPeoplePreviewSkeleton />}>
            <InstitutionPeoplePreview institutionId={id} />
          </Suspense>
        )}
      </div>
    </section>
  );
}

async function getInstitutionOrNotFound(id: string): Promise<Awaited<ReturnType<typeof fetchInstitution>>> {
  try {
    return await fetchInstitution(id);
  } catch (error) {
    if (isHttpStatusError(error, 404)) {
      notFound();
    }

    throw error;
  }
}
