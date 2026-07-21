import Link from "next/link";
import { notFound } from "next/navigation";
import { PencilIcon } from "lucide-react";

import { Button } from "@common/components/ui/button";
import { InstitutionalBreadcrumb } from "@features/institutional-auth/components/institutional-breadcrumb";
import { InstitutionalProfile } from "@features/institutional-auth/components/institutional-profile";
import { fetchInstitutionalPerson } from "@features/institutional-auth/services/fetch-institutional-person.service";
import { requireInstitutionalUser } from "@features/institutional-auth/services/get-institutional-user.service";
import { PlatformPageShell } from "@features/platform-auth/components/platform-page-shell";

export const metadata = { title: "Perfil" };

export default async function ProfilePage(): Promise<React.ReactElement> {
  await requireInstitutionalUser();
  const person = await fetchInstitutionalPerson();
  if (!person) notFound();

  return (
    <PlatformPageShell
      title="Perfil"
      description="Consultá tus datos personales."
      breadcrumb={<InstitutionalBreadcrumb />}
      actions={
        <Button asChild size="lg">
          <Link href="/profile/edit">
            <PencilIcon data-icon="inline-start" />
            Editar datos
          </Link>
        </Button>
      }
    >
      <InstitutionalProfile person={person} />
    </PlatformPageShell>
  );
}
