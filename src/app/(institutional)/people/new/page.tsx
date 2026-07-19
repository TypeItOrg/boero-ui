import { notFound } from "next/navigation";
import { UserPlusIcon } from "lucide-react";

import { InstitutionalBreadcrumb } from "@features/institutional-auth/components/institutional-breadcrumb";
import { PersonForm } from "@features/people/components/person-form";
import { PlatformPageShell } from "@features/platform-auth/components/platform-page-shell";
import { requireInstitutionalUser } from "@features/institutional-auth/services/get-institutional-user.service";
import { INSTITUTIONAL_PERMISSION } from "@features/institutional-auth/types/institutional-permission.types";
import { hasInstitutionalPermission } from "@features/institutional-auth/utils/institutional-permission.util";

export const metadata = { title: "Nuevo usuario" };

export default async function NewPersonPage(): Promise<React.ReactElement> {
  const user = await requireInstitutionalUser();
  if (!hasInstitutionalPermission(user, INSTITUTIONAL_PERMISSION.PERSON_CREATE)) notFound();

  return (
    <PlatformPageShell
      title="Nuevo usuario"
      description="Creá una cuenta institucional para una persona de tu organización."
      breadcrumb={<InstitutionalBreadcrumb />}
      minViewportHeight
      headerClassName="flex-row items-end justify-between"
      actions={
        <div className="from-primary to-primary/80 text-primary-foreground flex size-14 items-center justify-center rounded-xl bg-gradient-to-br shadow-xs">
          <UserPlusIcon className="size-7" />
        </div>
      }
    >
      <PersonForm mode="create" institutionId={user.institutionId} scope="institutional" />
    </PlatformPageShell>
  );
}
