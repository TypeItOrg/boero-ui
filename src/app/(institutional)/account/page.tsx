import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ReturnToLink } from "@common/components/navigation/return-to-link";
import { Button } from "@common/components/ui/button";
import { InstitutionalAccountHeader } from "@features/institutional-auth/components/institutional-account-header";
import { InstitutionalProfile } from "@features/institutional-auth/components/institutional-profile";
import { fetchInstitutionalPerson } from "@features/institutional-auth/services/fetch-institutional-person.service";
import { getInstitutionalMetadata } from "@features/institutional-auth/utils/institutional-metadata.util";

export async function generateMetadata(): Promise<Metadata> {
  return getInstitutionalMetadata("Perfil");
}

export default async function ProfilePage(): Promise<React.ReactElement> {
  const person = await fetchInstitutionalPerson();
  if (!person) notFound();

  return (
    <>
      <InstitutionalAccountHeader
        actions={
          <Button asChild size="lg">
            <ReturnToLink href="/account/edit">Editar</ReturnToLink>
          </Button>
        }
      />
      <InstitutionalProfile person={person} />
    </>
  );
}
