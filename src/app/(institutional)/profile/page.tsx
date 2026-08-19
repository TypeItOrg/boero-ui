import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { UserRoundIcon } from "lucide-react";

import { ReturnToLink } from "@common/components/navigation/return-to-link";
import { Button } from "@common/components/ui/button";
import { InstitutionalBreadcrumb } from "@features/institutional-auth/components/institutional-breadcrumb";
import { InstitutionalProfile } from "@features/institutional-auth/components/institutional-profile";
import { fetchInstitutionalPerson } from "@features/institutional-auth/services/fetch-institutional-person.service";
import { requireInstitutionalUser } from "@features/institutional-auth/services/get-institutional-user.service";
import { getInstitutionalMetadata } from "@features/institutional-auth/utils/institutional-metadata.util";
import { PlatformPageShell } from "@features/platform-auth/components/platform-page-shell";

export async function generateMetadata(): Promise<Metadata> {
  return getInstitutionalMetadata("Perfil");
}

export default async function ProfilePage(): Promise<React.ReactElement> {
  await requireInstitutionalUser();
  const person = await fetchInstitutionalPerson();
  if (!person) notFound();

  return (
    <PlatformPageShell
      title="Perfil"
      minViewportHeight
      breadcrumb={<InstitutionalBreadcrumb />}
      headerClassName="flex-row items-center justify-between"
      actionsClassName="self-stretch"
      actions={
        <div className="from-primary to-primary/80 text-primary-foreground hidden h-full items-center justify-center rounded-2xl bg-linear-to-br px-4 shadow-xs sm:flex">
          <UserRoundIcon className="size-6 sm:size-7" aria-hidden="true" />
        </div>
      }
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button asChild variant="outline" size="lg">
          <Link href="/">Volver</Link>
        </Button>
        <Button asChild size="lg">
          <ReturnToLink href="/profile/edit">Editar</ReturnToLink>
        </Button>
      </div>

      <InstitutionalProfile person={person} />
    </PlatformPageShell>
  );
}
