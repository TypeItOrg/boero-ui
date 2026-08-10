import * as React from "react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@common/components/ui/card";
import type { InstitutionalPerson } from "@features/institutional-auth/types/institutional-person.types";

type InstitutionalProfileSummaryProps = {
  person: InstitutionalPerson;
};

export function InstitutionalProfileSummary({ person }: InstitutionalProfileSummaryProps): React.ReactElement {
  return (
    <div className="flex flex-col gap-4">
      <Card className="bg-muted/25 p-5 sm:p-6">
        <CardHeader className="p-0">
          <CardTitle>
            {person.firstName} {person.lastName}
          </CardTitle>
          <CardDescription>Información personal de tu cuenta institucional.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <ProfileValue label="Documento" value={person.documentNumber} />
            <ProfileValue label="Fecha de nacimiento" value={formatDate(person.birthDate)} />
            <ProfileValue label="Email" value={person.email} />
            <ProfileValue label="Teléfono" value={person.phoneNumber} />
            <ProfileValue label="Nacionalidad" value={person.nationalityCountry?.name} />
            <ProfileValue label="Ciudad natal" value={person.birthCity?.name} />
          </dl>
        </CardContent>
      </Card>
      <Card className="bg-muted/25 p-5 sm:p-6">
        <CardHeader className="p-0">
          <CardTitle>Domicilio</CardTitle>
          <CardDescription>Dirección registrada en tu institución.</CardDescription>
        </CardHeader>
        <CardContent className="mt-4 p-0">
          <dl className="grid gap-4 sm:grid-cols-2">
            <ProfileValue label="Dirección" value={formatAddress(person)} />
            <ProfileValue label="Barrio" value={person.address?.neighborhood} />
            <ProfileValue label="Información adicional" value={person.address?.additionalInfo} />
          </dl>
        </CardContent>
      </Card>
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
