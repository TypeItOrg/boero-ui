import * as React from "react";
import { ShieldCheckIcon, UserRoundIcon, type LucideIcon } from "lucide-react";

import { Badge } from "@common/components/ui/badge";
import type { PersonRole } from "@features/people/types/person-role.types";
import type { Person } from "@features/people/types/person.types";

type PersonDetailViewProps = {
  person: Person;
  assignedRoles: PersonRole[];
};

export function PersonDetailView({ person, assignedRoles }: PersonDetailViewProps): React.ReactElement {
  return (
    <div className="grid items-start gap-4 xl:grid-cols-[minmax(0,1fr)_420px] 2xl:grid-cols-[minmax(0,1fr)_460px]">
      <section className="bg-muted/25 rounded-xl border p-4 sm:p-5">
        <header className="-mx-4 border-b px-4 pb-4 sm:-mx-5 sm:px-5 sm:pb-5">
          <DetailSectionHeader description="Información principal del usuario institucional." icon={UserRoundIcon} title="Datos personales" />
        </header>
        <dl className="mt-4 grid gap-4 sm:mt-5 sm:grid-cols-2 lg:grid-cols-3">
          <DetailValue label="Nombre" value={person.firstName} />
          <DetailValue label="Apellido" value={person.lastName} />
          <DetailValue label="Documento" value={person.documentNumber} />
          <DetailValue label="Fecha de nacimiento" value={formatDate(person.birthDate)} />
          <DetailValue label="Email" value={person.email} />
          <DetailValue label="Teléfono" value={person.phoneNumber} />
        </dl>
      </section>

      <section className="bg-muted/25 rounded-xl border p-4 sm:p-5">
        <header className="-mx-4 border-b px-4 pb-4 sm:-mx-5 sm:px-5 sm:pb-5">
          <DetailSectionHeader description="Permisos asignados actualmente a esta persona." icon={ShieldCheckIcon} title="Roles asignados" />
        </header>
        <div className="mt-4 flex flex-wrap gap-2 sm:mt-5">
          {assignedRoles.length > 0 ? (
            assignedRoles.map((role) => (
              <Badge key={role.roleId} variant="secondary" size="lg">
                {role.displayName}
              </Badge>
            ))
          ) : (
            <p className="text-muted-foreground text-sm">No tiene roles asignados.</p>
          )}
        </div>
      </section>
    </div>
  );
}

function DetailSectionHeader({ description, icon: Icon, title }: { description: string; icon: LucideIcon; title: string }): React.ReactElement {
  return (
    <div className="flex items-center gap-3.5">
      <div className="bg-primary/10 text-primary flex aspect-square min-h-11 min-w-11 shrink-0 items-center justify-center self-stretch rounded-xl">
        <Icon className="size-5" aria-hidden="true" />
      </div>
      <div className="min-w-0">
        <h2 className="text-base font-semibold">{title}</h2>
        <p className="text-muted-foreground text-sm">{description}</p>
      </div>
    </div>
  );
}

function DetailValue({ label, value }: { label: string; value: string | null }): React.ReactElement {
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
