import Link from "next/link";
import { notFound } from "next/navigation";

import type { Metadata } from "next";

import { Button } from "@common/components/ui/button";
import type { QueryParamValue } from "@common/types/query-param.types";
import { getSafeReturnTo } from "@common/utils/return-to.util";
import { InstitutionalAccountHeader } from "@features/institutional-auth/components/institutional-account-header";
import { InstitutionalProfileForm } from "@features/institutional-auth/components/institutional-profile";
import { fetchInstitutionalPerson } from "@features/institutional-auth/services/fetch-institutional-person.service";
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
  const destination = getSafeReturnTo(returnTo, "/account");

  const person = await fetchInstitutionalPerson();
  if (!person) notFound();

  return (
    <>
      <InstitutionalAccountHeader />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button asChild variant="outline" size="lg">
          <Link href={destination}>Volver</Link>
        </Button>
      </div>

      <InstitutionalProfileForm person={person} returnTo={destination} />
    </>
  );
}
