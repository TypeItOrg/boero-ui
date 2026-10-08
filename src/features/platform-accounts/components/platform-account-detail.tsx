import type { ReactElement, ReactNode } from "react";

import { ShieldCheckIcon, UserRoundIcon } from "lucide-react";

import { SectionHeader } from "@common/components/section-header";
import { Badge } from "@common/components/ui/badge";
import { DETAIL_LABEL_CLASS_NAME } from "@common/constants/detail-label.constants";

import { PlatformAccountStatusControl } from "@features/platform-accounts/components/platform-account-status-control";
import type { PlatformAccountAdmin } from "@features/platform-accounts/types/platform-account-admin.types";

const dateTimeFormatter = new Intl.DateTimeFormat("es-AR", {
  dateStyle: "long",
  timeStyle: "short",
});

type PlatformAccountDetailProps = {
  account: PlatformAccountAdmin;
};

export function PlatformAccountDetail({ account }: PlatformAccountDetailProps): ReactElement {
  return (
    <div className="grid grid-cols-12 gap-4">
      <div className="bg-muted/25 col-span-12 flex flex-col gap-4 rounded-xl border p-5 md:p-6 lg:col-span-8">
        <header className="-mx-5 border-b px-5 pb-5 md:-mx-6 md:px-6">
          <SectionHeader
            icon={UserRoundIcon}
            title="Información del administrador"
            description="Datos de identidad y rol asignado."
            titleClassName="@xl/section-header:text-lg @xl/section-header:leading-none"
          />
        </header>
        <dl className="mt-1 grid gap-x-8 gap-y-6 sm:grid-cols-2">
          <DetailItem label="Nombre" value={account.name} />
          <DetailItem label="Apellido" value={account.lastName} />
          <DetailItem label="Correo electrónico" value={account.email} />
          <DetailItem label="Fecha de alta" value={dateTimeFormatter.format(new Date(account.createdAt))} />
          <DetailItem
            label="Rol"
            value={
              <Badge variant="secondary" size="lg">
                {account.roleName}
              </Badge>
            }
          />
        </dl>
      </div>

      <div className="bg-muted/25 col-span-12 flex flex-col gap-4 rounded-xl border p-5 md:p-6 lg:col-span-4">
        <header className="-mx-5 border-b px-5 pb-5 md:-mx-6 md:px-6">
          <SectionHeader
            icon={ShieldCheckIcon}
            title="Estado de acceso"
            description="Al deshabilitarlo, perderá el acceso."
            titleClassName="@xl/section-header:text-lg @xl/section-header:leading-none"
          />
        </header>
        <div className="bg-background mt-1 flex items-center justify-between gap-4 rounded-lg border p-4">
          <span className={DETAIL_LABEL_CLASS_NAME}>Acceso a la plataforma</span>
          <Badge variant={account.enabled ? "success" : "destructive"}>{account.enabled ? "Habilitado" : "Deshabilitado"}</Badge>
        </div>
        <div className="mt-auto pt-4">
          <PlatformAccountStatusControl accountId={account.platformAccountId} enabled={account.enabled} />
        </div>
      </div>
    </div>
  );
}

function DetailItem({ label, value }: { label: string; value: ReactNode }): ReactElement {
  return (
    <div className="min-w-0">
      <dt className={DETAIL_LABEL_CLASS_NAME}>{label}</dt>
      <dd className="text-foreground mt-1.5 min-w-0 text-base font-medium break-words">{value}</dd>
    </div>
  );
}
