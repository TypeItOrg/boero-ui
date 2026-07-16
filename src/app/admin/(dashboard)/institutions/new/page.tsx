import { Building2 } from "lucide-react";
import { InstitutionForm } from "@features/institutions/components/institution-form";
import { PlatformBreadcrumb } from "@features/platform-auth/components/platform-breadcrumb";
import { PlatformPageShell } from "@features/platform-auth/components/platform-page-shell";

export const metadata = {
  title: "Nueva institución",
  description: "Creá una nueva institución en la plataforma.",
};

export default function NewInstitutionPage(): React.ReactElement {
  return (
    <PlatformPageShell
      title="Nueva institución"
      description="Completá los datos esenciales para sumarla a la plataforma."
      minViewportHeight
      breadcrumb={<PlatformBreadcrumb />}
      actions={
        <div className="bg-primary text-primary-foreground flex size-14 items-center justify-center rounded-xl">
          <Building2 className="size-7" />
        </div>
      }
    >
      <InstitutionForm mode="create" />
    </PlatformPageShell>
  );
}
