import * as React from "react";
import { HomeIcon, UserRoundIcon, type LucideIcon } from "lucide-react";

import type { InstitutionalPerson } from "@features/institutional-auth/types/institutional-person.types";

type InstitutionalProfileSummaryProps = {
  person: InstitutionalPerson;
};

export function InstitutionalProfileSummary({ person }: InstitutionalProfileSummaryProps): React.ReactElement {
  return (
    <div className="flex flex-col gap-4">
      <div className="bg-muted/25 rounded-xl border p-4 sm:p-5">
        <header className="-mx-4 border-b px-4 pb-4 sm:-mx-5 sm:px-5 sm:pb-5">
          <ProfileSectionHeader
            description="Información principal de tu cuenta institucional."
            icon={UserRoundIcon}
            title="Datos personales"
          />
        </header>
        <div className="mt-4 sm:mt-5">
          <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <ProfileValue label="Nombre completo" value={`${person.firstName} ${person.lastName}`} />
            <ProfileValue label="Documento" value={person.documentNumber} />
            <ProfileValue label="Fecha de nacimiento" value={formatDate(person.birthDate)} />
            <ProfileValue label="Email" value={person.email} />
            <ProfileValue label="Teléfono" value={person.phoneNumber} />
            <ProfileValue label="Nacionalidad" value={person.nationalityCountry?.name} />
            <ProfileValue label="Ciudad natal" value={person.birthCity?.name} />
          </dl>
        </div>
      </div>
      <div className="bg-muted/25 rounded-xl border p-4 sm:p-5">
        <header className="-mx-4 border-b px-4 pb-4 sm:-mx-5 sm:px-5 sm:pb-5">
          <ProfileSectionHeader
            description="Dirección registrada en tu institución."
            icon={HomeIcon}
            title="Domicilio"
          />
        </header>
        <div className="mt-4 sm:mt-5">
          <dl className="grid gap-4 sm:grid-cols-2">
            <ProfileValue label="Dirección" value={formatAddress(person)} />
            <ProfileValue label="Barrio" value={person.address?.neighborhood} />
            <ProfileValue label="Información adicional" value={person.address?.additionalInfo} />
          </dl>
        </div>
      </div>
    </div>
  );
}

function ProfileSectionHeader({
  description,
  icon: Icon,
  title,
}: {
  description: string;
  icon: LucideIcon;
  title: string;
}): React.ReactElement {
  return (
    <div className="flex items-center gap-3.5">
      <div className="bg-primary/10 text-primary flex aspect-square min-h-11 min-w-11 shrink-0 items-center justify-center self-stretch rounded-xl">
        <Icon className="size-5" aria-hidden="true" />
      </div>
      <div className="min-w-0">
        <h2 className="text-foreground font-semibold">{title}</h2>
        <p className="text-muted-foreground text-sm">{description}</p>
      </div>
    </div>
  );
}

function ProfileValue({ label, value }: { label: string; value?: string | null }): React.ReactElement {
  return (
    <div>
      <dt className="text-muted-foreground text-xs font-medium tracking-wider uppercase">{label}</dt>
      <dd className="mt-1 text-sm font-medium">{value || "—"}</dd>
    </div>
  );
}

function formatDate(value: string | null): string {
  if (!value) return "—";
  const [year, month, day] = value.split("-");
  return year && month && day ? `${day}/${month}/${year}` : value;
}

function formatAddress(person: InstitutionalPerson): string {
  const address = person.address;
  if (!address) return "—";
  return [
    address.street,
    address.number,
    address.floor && `Piso ${address.floor}`,
    address.apartment && `Depto. ${address.apartment}`,
    address.city?.name,
  ]
    .filter(Boolean)
    .join(", ");
}
