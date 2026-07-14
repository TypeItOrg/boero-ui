import { notFound } from "next/navigation";
import { UserRoundIcon } from "lucide-react";

import { isHttpStatusError } from "@common/utils/create-http-error.util";
import { fetchInstitution } from "@features/institutions/services/fetch-institution.service";
import { PersonForm } from "@features/people/components/person-form";
import { PlatformBreadcrumb } from "@features/platform-auth/components/platform-breadcrumb";
import { PlatformPageShell } from "@features/platform-auth/components/platform-page-shell";

export const metadata = {
  title: "Nuevo usuario — Boero",
  description: "Creá un nuevo usuario institucional en la plataforma.",
};

type NewPersonPageProps = {
  params: Promise<{ id: string }>;
};

export default async function NewPersonPage({ params }: NewPersonPageProps): Promise<React.ReactElement> {
  const { id } = await params;
  const institution = await getInstitutionOrNotFound(id);

  return (
    <PlatformPageShell
      title="Nuevo usuario"
      description={`Creá una cuenta institucional para ${institution.name}. El rol inicial será Postulante.`}
      minViewportHeight
      breadcrumb={<PlatformBreadcrumb segmentLabels={{ [id]: institution.name }} />}
      actions={
        <div className="bg-primary text-primary-foreground flex size-14 items-center justify-center rounded-xl">
          <UserRoundIcon className="size-7" />
        </div>
      }
    >
      <PersonForm mode="create" institutionId={id} />
    </PlatformPageShell>
  );
}

async function getInstitutionOrNotFound(id: string): Promise<Awaited<ReturnType<typeof fetchInstitution>>> {
  try {
    return await fetchInstitution(id);
  } catch (error) {
    if (isHttpStatusError(error, 404)) {
      notFound();
    }

    throw error;
  }
}
