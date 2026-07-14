import { Badge } from "@common/components/ui/badge";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@common/components/ui/card";
import { PlatformAccountStatusControl } from "@features/platform-accounts/components/platform-account-status-control";
import type { PlatformAccountAdmin } from "@features/platform-accounts/types/platform-account.types";

const dateTimeFormatter = new Intl.DateTimeFormat("es-AR", {
  dateStyle: "long",
  timeStyle: "short",
});

type PlatformAccountDetailProps = {
  account: PlatformAccountAdmin;
  currentAccountId: string | undefined;
};

export function PlatformAccountDetail({ account, currentAccountId }: PlatformAccountDetailProps): React.ReactElement {
  return (
    <div className="grid grid-cols-12 gap-5">
      <Card className="col-span-12 h-full lg:col-span-8">
        <CardHeader>
          <CardTitle>Información del administrador</CardTitle>
          <CardDescription>Datos de identidad y rol asignado.</CardDescription>
        </CardHeader>
        <CardContent className="flex-1">
          <dl className="grid gap-x-8 gap-y-6 sm:grid-cols-2">
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
        </CardContent>
      </Card>

      <Card className="col-span-12 h-full lg:col-span-4">
        <CardHeader>
          <CardTitle>Estado de acceso</CardTitle>
          <CardDescription>Al deshabilitarlo se cerrarán sus sesiones y no podrá volver a ingresar.</CardDescription>
        </CardHeader>
        <CardContent className="flex-1">
          <div className="flex items-center justify-between gap-4 rounded-lg border p-4">
            <span className="text-base font-medium">Acceso a la plataforma</span>
            <Badge variant={account.enabled ? "success" : "destructive"}>
              {account.enabled ? "Habilitado" : "Deshabilitado"}
            </Badge>
          </div>
        </CardContent>
        <CardFooter>
          <PlatformAccountStatusControl
            accountId={account.platformAccountId}
            enabled={account.enabled}
            isCurrentAccount={currentAccountId === account.platformAccountId}
          />
        </CardFooter>
      </Card>
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
