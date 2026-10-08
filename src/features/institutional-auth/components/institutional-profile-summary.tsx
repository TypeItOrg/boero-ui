import { DETAIL_LABEL_CLASS_NAME } from "@common/constants/detail-label.constants";
import { OptionalValue } from "@common/components/optional-value";
import * as React from "react";
import { HomeIcon, UserRoundIcon, type LucideIcon } from "lucide-react";

import type { InstitutionalPerson } from "@features/institutional-auth/types/institutional-person.types";
import { SectionHeader } from "@common/components/section-header";

type InstitutionalProfileSummaryProps = {
  person: InstitutionalPerson;
};

export function InstitutionalProfileSummary({ person }: InstitutionalProfileSummaryProps): React.ReactElement {
  return (
    <div className="flex flex-col gap-4">
      <div className="bg-muted/25 rounded-xl border p-4 sm:p-5">
        <header className="-mx-4 border-b px-4 pb-4 sm:-mx-5 sm:px-5 sm:pb-5">
          <ProfileSectionHeader description="Información principal de tu cuenta institucional." icon={UserRoundIcon} title="Datos personales" />
        </header>
        <div className="mt-4 sm:mt-5">
          <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <ProfileValue fallback="Sin nombre registrado" label="Nombre completo" value={`${person.firstName} ${person.lastName}`} />
            <ProfileValue fallback="Sin documento" label="Documento" value={person.documentNumber} />
            <ProfileValue fallback="Sin fecha de nacimiento" label="Fecha de nacimiento" value={formatDate(person.birthDate)} />
            <ProfileValue fallback="Sin correo electrónico" label="Email" value={person.email} />
            <ProfileValue fallback="Sin teléfono" label="Teléfono" value={person.phoneNumber} />
            <ProfileValue fallback="Sin nacionalidad informada" label="Nacionalidad" value={person.nationalityCountry?.name} />
            <ProfileValue fallback="Sin ciudad natal informada" label="Ciudad natal" value={person.birthCity?.name} />
          </dl>
        </div>
      </div>
      <div className="bg-muted/25 rounded-xl border p-4 sm:p-5">
        <header className="-mx-4 border-b px-4 pb-4 sm:-mx-5 sm:px-5 sm:pb-5">
          <ProfileSectionHeader description="Dirección registrada en tu institución." icon={HomeIcon} title="Domicilio" />
        </header>
        <div className="mt-4 sm:mt-5">
          <dl className="grid gap-4 sm:grid-cols-2">
            <ProfileValue fallback="Sin dirección" label="Dirección" value={formatAddress(person)} />
            <ProfileValue fallback="Sin barrio informado" label="Barrio" value={person.address?.neighborhood} />
            <ProfileValue fallback="Sin información adicional" label="Información adicional" value={person.address?.additionalInfo} />
          </dl>
        </div>
      </div>
    </div>
  );
}

function ProfileSectionHeader({ description, icon: Icon, title }: { description: string; icon: LucideIcon; title: string }): React.ReactElement {
  return <SectionHeader icon={Icon} title={title} description={description} />;
}

function ProfileValue({ label, value, fallback }: { label: string; value?: string | null; fallback: string }): React.ReactElement {
  return (
    <div>
      <dt className={DETAIL_LABEL_CLASS_NAME}>{label}</dt>
      <dd className="mt-1 text-sm font-medium">
        <OptionalValue value={value} fallback={fallback} />
      </dd>
    </div>
  );
}

function formatDate(value: string | null): string | null {
  if (!value) {
    return null;
  }
  const [year, month, day] = value.split("-");
  return year && month && day ? `${day}/${month}/${year}` : value;
}

function formatAddress(person: InstitutionalPerson): string | null {
  const address = person.address;
  if (!address) {
    return null;
  }
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
