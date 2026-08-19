import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { UserRoundIcon } from "lucide-react";

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
      breadcrumb={<InstitutionalBreadcrumb />}
      headerClassName="flex-row items-center justify-between"
      actionsClassName="self-stretch"
      actions={
        <div className="from-primary to-primary/80 text-primary-foreground flex h-full items-center justify-center rounded-2xl bg-linear-to-br px-4 shadow-xs">
          <UserRoundIcon className="size-6 sm:size-7" aria-hidden="true" />
        </div>
      }
    >
      <InstitutionalProfile person={person} />
    </PlatformPageShell>
  );
}
