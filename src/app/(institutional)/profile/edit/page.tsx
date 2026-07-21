import { notFound } from "next/navigation";
import { UserRoundPenIcon } from "lucide-react";

import { InstitutionalBreadcrumb } from "@features/institutional-auth/components/institutional-breadcrumb";
import { InstitutionalProfileForm } from "@features/institutional-auth/components/institutional-profile";
import { fetchInstitutionalPerson } from "@features/institutional-auth/services/fetch-institutional-person.service";
import { requireInstitutionalUser } from "@features/institutional-auth/services/get-institutional-user.service";
import { PlatformPageShell } from "@features/platform-auth/components/platform-page-shell";

export const metadata = { title: "Editar perfil" };

export default async function EditProfilePage(): Promise<React.ReactElement> {
  await requireInstitutionalUser();

  const person = await fetchInstitutionalPerson();
  if (!person) notFound();

  return (
    <PlatformPageShell
      title="Editar perfil"
      description="Actualizá tus datos personales."
      breadcrumb={<InstitutionalBreadcrumb />}
      headerClassName="flex-row items-end justify-between"
      actions={
        <div className="from-primary to-primary/80 text-primary-foreground flex size-14 items-center justify-center rounded-xl bg-gradient-to-br shadow-xs">
          <UserRoundPenIcon className="size-7" />
        </div>
      }
    >
      <InstitutionalProfileForm person={person} />
    </PlatformPageShell>
  );
}
