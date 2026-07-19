import Link from "next/link";
import { notFound } from "next/navigation";
import { PencilIcon } from "lucide-react";

import { Button } from "@common/components/ui/button";
import { InstitutionalBreadcrumb } from "@features/institutional-auth/components/institutional-breadcrumb";
import { InstitutionalProfile } from "@features/institutional-auth/components/institutional-profile";
import { fetchInstitutionalPerson } from "@features/institutional-auth/services/fetch-institutional-person.service";
import { requireInstitutionalUser } from "@features/institutional-auth/services/get-institutional-user.service";
import { INSTITUTIONAL_PERMISSION } from "@features/institutional-auth/types/institutional-permission.types";
import { hasInstitutionalPermission } from "@features/institutional-auth/utils/institutional-permission.util";
import { PlatformPageShell } from "@features/platform-auth/components/platform-page-shell";

export const metadata = { title: "Perfil" };

export default async function ProfilePage(): Promise<React.ReactElement> {
  const user = await requireInstitutionalUser();
  const person = await fetchInstitutionalPerson();
  if (!person) notFound();

  const canUpdate = hasInstitutionalPermission(user, INSTITUTIONAL_PERMISSION.PERSON_UPDATE_OWN);

  return (
    <PlatformPageShell
      title="Perfil"
      description="Consultá tus datos personales."
      breadcrumb={<InstitutionalBreadcrumb />}
      actions={
        canUpdate ? (
          <Button asChild size="lg">
            <Link href="/profile/edit">
              <PencilIcon data-icon="inline-start" />
              Editar datos
            </Link>
          </Button>
        ) : undefined
      }
    >
      <InstitutionalProfile person={person} />
    </PlatformPageShell>
  );
}
