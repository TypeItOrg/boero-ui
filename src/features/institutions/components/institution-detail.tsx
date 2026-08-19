import { FileTextIcon, MapPinIcon, PhoneIcon, type LucideIcon } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@common/components/ui/card";
import type { Institution } from "@features/institutions/types/institution.types";

type InstitutionDetailProps = {
  institution: Institution;
};

export function InstitutionDetail({ institution }: InstitutionDetailProps): React.ReactElement {
  const address = formatAddress(institution);

  return (
    <section className="flex h-full min-w-0 flex-col gap-4">
      <Card className="bg-muted/25 gap-0 p-5 sm:p-6">
        <CardHeader className="-mx-5 border-b px-5 pb-5 sm:-mx-6 sm:px-6">
          <InstitutionSectionHeader
            description="Datos de localización de la institución."
            icon={MapPinIcon}
            title="Ubicación"
          />
        </CardHeader>
        <CardContent className="mt-5 p-0">
          <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <LocationDetail label="Dirección" value={address} />
            <LocationDetail label="País" value={institution.country.name} />
            <LocationDetail label="Provincia" value={institution.province.name} />
            <LocationDetail label="Ciudad" value={institution.city.name} />
          </dl>
        </CardContent>
      </Card>

      <Card className="bg-muted/25 gap-0 p-5 sm:p-6">
        <CardHeader className="-mx-5 border-b px-5 pb-5 sm:-mx-6 sm:px-6">
          <InstitutionSectionHeader
            description="Canales principales para comunicarse con la institución."
            icon={PhoneIcon}
            title="Contacto"
          />
        </CardHeader>
        <CardContent className="mt-5 p-0">
          <dl className="grid gap-6 sm:grid-cols-2">
            <ContactDetail label="Teléfono" value={institution.phoneNumber} />
            <ContactDetail label="Correo electrónico" value={institution.email} />
          </dl>
        </CardContent>
      </Card>

      <Card className="bg-muted/25 flex flex-1 flex-col gap-0 p-5 sm:p-6">
        <CardHeader className="-mx-5 border-b px-5 pb-5 sm:-mx-6 sm:px-6">
          <InstitutionSectionHeader
            description="Notas y referencias complementarias de la institución."
            icon={FileTextIcon}
            title="Información adicional"
          />
        </CardHeader>
        <CardContent className="mt-5 flex flex-1 p-0">
          <p className="text-foreground text-base leading-6 whitespace-pre-wrap">
            {institution.additionalInfo?.trim() || "Sin información adicional."}
          </p>
        </CardContent>
      </Card>
    </section>
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
    <div className="flex items-stretch gap-3.5">
      <div className="bg-primary/10 text-primary flex aspect-square min-h-11 min-w-11 shrink-0 items-center justify-center self-stretch rounded-xl">
        <Icon className="size-5" aria-hidden="true" />
      </div>
      <div className="flex min-w-0 flex-col justify-center">
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </div>
    </div>
  );
}

function LocationDetail({ label, value }: { label: string; value: string }): React.ReactElement {
  return (
    <div>
      <dt className="text-muted-foreground text-xs font-medium tracking-wider uppercase">{label}</dt>
      <dd className="text-foreground mt-1 text-sm font-medium">{value}</dd>
    </div>
  );
}

function ContactDetail({ label, value }: { label: string; value: string | null }): React.ReactElement {
  return (
    <div className="min-w-0">
      <dt className="text-muted-foreground text-xs font-medium tracking-wider uppercase">{label}</dt>
      <dd className="text-foreground mt-1 truncate text-sm font-medium">{value?.trim() || "No informado"}</dd>
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
