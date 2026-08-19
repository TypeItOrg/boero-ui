import Link from "next/link";
import { FileTextIcon, MapPinIcon, PhoneIcon, type LucideIcon } from "lucide-react";

import { Button } from "@common/components/ui/button";
import { ReturnToLink } from "@common/components/navigation/return-to-link";
import type { Institution } from "@features/institutions/types/institution.types";

type InstitutionalInstitutionDetailProps = {
  canUpdate: boolean;
  institution: Institution;
  returnTo: string;
};

export function InstitutionalInstitutionDetail({
  canUpdate,
  institution,
  returnTo,
}: InstitutionalInstitutionDetailProps): React.ReactElement {
  const address = formatAddress(institution);

  return (
    <div className="flex flex-1 flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button asChild variant="outline" size="lg">
          <Link href={returnTo}>Volver</Link>
        </Button>
        {canUpdate ? (
          <Button asChild size="lg">
            <ReturnToLink href="/institution/edit" returnTo={returnTo}>
              Editar
            </ReturnToLink>
          </Button>
        ) : null}
      </div>
      <div className="bg-muted/25 rounded-xl border p-4 sm:p-5">
        <InstitutionSectionHeader
          description="Datos de localización de la institución."
          icon={MapPinIcon}
          title="Ubicación"
        />

        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <LocationDetail label="Dirección" value={address} />
          <LocationDetail label="País" value={institution.country.name} />
          <LocationDetail label="Provincia" value={institution.province.name} />
          <LocationDetail label="Ciudad" value={institution.city.name} />
        </div>
      </div>

      <div className="bg-muted/25 rounded-xl border p-4 sm:p-5">
        <InstitutionSectionHeader
          description="Canales principales para comunicarse con la institución."
          icon={PhoneIcon}
          title="Contacto"
        />

        <div className="mt-5 grid gap-6 sm:grid-cols-2">
          <ContactDetail label="Teléfono" value={institution.phoneNumber} />
          <ContactDetail label="Correo electrónico" value={institution.email} />
        </div>
      </div>

      <div className="bg-muted/25 flex flex-1 flex-col rounded-xl border p-4 sm:p-5">
        <InstitutionSectionHeader
          description="Notas y referencias complementarias de la institución."
          icon={FileTextIcon}
          title="Información adicional"
        />
        <p className="text-foreground mt-5 flex-1 text-base leading-6 whitespace-pre-wrap">
          {institution.additionalInfo?.trim() || "Sin información adicional."}
        </p>
      </div>
    </div>
  );
}

function InstitutionSectionHeader({
  description,
  icon: Icon,
  title,
}: {
  description: string;
  icon: LucideIcon;
  title: string;
}): React.ReactElement {
  return (
    <header className="-mx-4 border-b px-4 pb-4 sm:-mx-5 sm:px-5 sm:pb-5">
      <div className="flex items-center gap-3.5">
        <div className="bg-primary/10 text-primary flex aspect-square min-h-11 min-w-11 shrink-0 items-center justify-center self-stretch rounded-xl">
          <Icon className="size-5" aria-hidden="true" />
        </div>
        <div className="min-w-0">
          <h2 className="text-foreground font-semibold">{title}</h2>
          <p className="text-muted-foreground text-sm">{description}</p>
        </div>
      </div>
    </header>
  );
}

interface LocationDetailProps extends React.HTMLAttributes<HTMLDivElement> {
  label: string;
  value: string;
}

function LocationDetail({ label, value, ...props }: LocationDetailProps): React.ReactElement {
  return (
    <div {...props}>
      <p className="text-muted-foreground text-sm">{label}</p>
      <p className="text-foreground mt-1.5 text-base font-medium">{value}</p>
    </div>
  );
}

function ContactDetail({ label, value }: { label: string; value: string | null }): React.ReactElement {
  return (
    <div className="min-w-0">
      <p className="text-muted-foreground text-sm">{label}</p>
      <p className="text-foreground mt-1.5 truncate text-base font-medium">{value?.trim() || "No informado"}</p>
    </div>
  );
}

function formatAddress(institution: Institution): string {
  const street = [institution.street, institution.number]
    .filter((part): part is string => Boolean(part?.trim()))
    .join(" ");

  return (
    [street, institution.neighborhood].filter((part): part is string => Boolean(part?.trim())).join(", ") ||
    "Dirección no informada"
  );
}
