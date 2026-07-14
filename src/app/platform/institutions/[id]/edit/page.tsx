import { notFound } from "next/navigation";

import { NavigationLink } from "@common/components/ui/navigation-link";
import { isHttpStatusError } from "@common/utils/create-http-error.util";
import { InstitutionForm } from "@features/institutions/components/institution-form";
import { fetchInstitution } from "@features/institutions/services/fetch-institution.service";
import { PlatformBreadcrumb } from "@features/platform-auth/components/platform-breadcrumb";
import { PlatformPageShell } from "@features/platform-auth/components/platform-page-shell";

type EditInstitutionPageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditInstitutionPage({ params }: EditInstitutionPageProps): Promise<React.ReactElement> {
  const { id } = await params;
  const institution = await getInstitutionOrNotFound(id);

  if (!institution.active) {
    return (
      <PlatformPageShell
        title="Institución inactiva"
        description="Reactivá la institución desde su ficha antes de editar sus datos."
        breadcrumb={<PlatformBreadcrumb segmentLabels={{ [id]: institution.name }} />}
        actions={
          <NavigationLink
            href={`/platform/institutions/${id}`}
            className="text-muted-foreground hover:text-foreground focus-visible:ring-ring rounded-sm text-sm font-medium underline-offset-4 transition-colors hover:underline focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
          >
            Ver ficha
          </NavigationLink>
        }
      />
    );
  }

  return (
    <PlatformPageShell
      title="Editar institución"
      description={`Editá los datos de ${institution.name}.`}
      breadcrumb={<PlatformBreadcrumb segmentLabels={{ [id]: institution.name }} />}
      actions={
        <NavigationLink
          href={`/platform/institutions/${id}/people`}
          className="text-muted-foreground hover:text-foreground focus-visible:ring-ring rounded-sm text-sm font-medium underline-offset-4 transition-colors hover:underline focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
        >
          Administrar usuarios
        </NavigationLink>
      }
    >
      <InstitutionForm mode="edit" institution={institution} />
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
