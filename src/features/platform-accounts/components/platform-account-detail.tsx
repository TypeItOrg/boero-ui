import { Badge } from "@common/components/ui/badge";
import { PlatformAccountStatusControl } from "@features/platform-accounts/components/platform-account-status-control";
import type { PlatformAccountAdmin } from "@features/platform-accounts/types/platform-account.types";
import { Metadata } from "next";

const dateTimeFormatter = new Intl.DateTimeFormat("es-AR", {
  dateStyle: "long",
  timeStyle: "short",
});

type PlatformAccountDetailProps = {
  account: PlatformAccountAdmin;
};

export function PlatformAccountDetail({ account }: PlatformAccountDetailProps): React.ReactElement {
  return (
    <div className="grid grid-cols-12 gap-5">
      <div className="bg-muted/25 col-span-12 flex flex-col gap-4 rounded-xl border p-5 md:p-6 lg:col-span-8">
        <div>
          <h2 className="text-foreground text-lg leading-none font-semibold">Información del administrador</h2>
          <p className="text-muted-foreground mt-1.5 text-sm">Datos de identidad y rol asignado.</p>
        </div>
        <dl className="mt-2 grid gap-x-8 gap-y-6 sm:grid-cols-2">
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
        <div>
          <h2 className="text-foreground text-lg leading-none font-semibold">Estado de acceso</h2>
          <p className="text-muted-foreground mt-1.5 text-sm">
            Al deshabilitarlo se cerrarán sus sesiones y no podrá volver a ingresar.
          </p>
        </div>
        <div className="bg-background mt-2 flex items-center justify-between gap-4 rounded-lg border p-4">
          <span className="text-base font-medium">Acceso a la plataforma</span>
          <Badge variant={account.enabled ? "success" : "destructive"}>
            {account.enabled ? "Habilitado" : "Deshabilitado"}
          </Badge>
        </div>
        <div className="mt-auto pt-4">
          <PlatformAccountStatusControl accountId={account.platformAccountId} enabled={account.enabled} />
        </div>
      </div>
    </div>
  );
}

function DetailItem({ label, value }: { label: string; value: React.ReactNode }): React.ReactElement {
  return (
    <div className="min-w-0">
      <dt className="text-muted-foreground text-sm">{label}</dt>
      <dd className="text-foreground mt-1.5 min-w-0 text-base font-medium break-words">{value}</dd>
    </div>
  );
}
