import { DETAIL_LABEL_CLASS_NAME } from "@common/constants/detail-label.constants";
import { OptionalValue } from "@common/components/optional-value";
import * as React from "react";
import { ShieldCheckIcon, UserRoundIcon, type LucideIcon } from "lucide-react";

import { Badge } from "@common/components/ui/badge";
import type { PersonRole } from "@features/people/types/person-role.types";
import type { Person } from "@features/people/types/person.types";
import { SectionHeader } from "@common/components/section-header";

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
          <DetailValue fallback="Sin nombre" label="Nombre" value={person.firstName} />
          <DetailValue fallback="Sin apellido" label="Apellido" value={person.lastName} />
          <DetailValue fallback="Sin documento" label="Documento" value={person.documentNumber} />
          <DetailValue fallback="Sin fecha de nacimiento" label="Fecha de nacimiento" value={formatDate(person.birthDate)} />
          <DetailValue fallback="Sin correo electrónico" label="Email" value={person.email} />
          <DetailValue fallback="Sin teléfono" label="Teléfono" value={person.phoneNumber} />
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
  return <SectionHeader icon={Icon} title={title} description={description} />;
}

function DetailValue({ label, value, fallback }: { label: string; value: string | null; fallback: string }): React.ReactElement {
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
