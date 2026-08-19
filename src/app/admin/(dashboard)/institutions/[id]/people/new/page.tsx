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
      minViewportHeight
      breadcrumb={<PlatformBreadcrumb segmentLabels={{ [id]: institution.name }} />}
      headerClassName="flex-row items-center justify-between"
      actionsClassName="self-stretch"
      actions={
        <div className="from-primary to-primary/80 text-primary-foreground hidden h-full items-center justify-center rounded-2xl bg-linear-to-br px-4 shadow-xs sm:flex">
          <UserRoundIcon className="size-6 sm:size-7" />
        </div>
      }
    >
      <PersonForm mode="create" institutionId={id} returnTo={destination} />
    </PlatformPageShell>
  );
}
