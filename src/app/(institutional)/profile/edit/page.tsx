import { notFound } from "next/navigation";
import { UserRoundPenIcon } from "lucide-react";

import type { QueryParamValue } from "@common/types/query-param.types";
import { getSafeReturnTo } from "@common/utils/return-to.util";
import { InstitutionalBreadcrumb } from "@features/institutional-auth/components/institutional-breadcrumb";
import { InstitutionalProfileForm } from "@features/institutional-auth/components/institutional-profile";
import { fetchInstitutionalPerson } from "@features/institutional-auth/services/fetch-institutional-person.service";
import { requireInstitutionalUser } from "@features/institutional-auth/services/get-institutional-user.service";
import { PlatformPageShell } from "@features/platform-auth/components/platform-page-shell";

import type { Metadata } from "next";
import { getInstitutionalMetadata } from "@features/institutional-auth/utils/institutional-metadata.util";

export async function generateMetadata(): Promise<Metadata> {
  return getInstitutionalMetadata("Editar perfil");
}

export default async function EditProfilePage({
  searchParams,
}: {
  searchParams: Promise<{ returnTo?: QueryParamValue }>;
}): Promise<React.ReactElement> {
  const { returnTo } = await searchParams;
  const destination = getSafeReturnTo(returnTo, "/profile");
  await requireInstitutionalUser();

  const person = await fetchInstitutionalPerson();
  if (!person) notFound();

  return (
    <PlatformPageShell
      title="Editar perfil"
      description="Actualizá tus datos personales."
      breadcrumb={<InstitutionalBreadcrumb />}
      headerClassName="flex-row items-center justify-between"
      actionsClassName="self-stretch"
      actions={
        <div className="from-primary to-primary/80 text-primary-foreground flex h-full items-center justify-center rounded-2xl bg-linear-to-br px-4 shadow-xs">
          <UserRoundPenIcon className="size-6 sm:size-7" />
        </div>
      }
    >
      <InstitutionalProfileForm person={person} returnTo={destination} />
    </PlatformPageShell>
  );
}
