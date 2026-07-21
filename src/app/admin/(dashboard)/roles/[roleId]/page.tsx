import { notFound } from "next/navigation";
import { KeyRoundIcon, PencilIcon, ShieldCheckIcon, UsersIcon } from "lucide-react";

import { Badge } from "@common/components/ui/badge";
import { Button } from "@common/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@common/components/ui/card";
import { ReturnToLink } from "@common/components/navigation/return-to-link";
import { PlatformBreadcrumb } from "@features/platform-auth/components/platform-breadcrumb";
import { PlatformPageShell } from "@features/platform-auth/components/platform-page-shell";
import { InstitutionRolePermissions } from "@features/roles/components/institution-role-permissions";
import { PlatformRoleDeleteButton } from "@features/roles/components/platform-role-delete-button";
import { fetchPlatformPermissionGroups, fetchPlatformRole } from "@features/roles/services/platform-role.service";

export const metadata = { title: "Detalle del rol" };

export default async function PlatformRoleDetailPage({
  params,
}: {
  params: Promise<{ roleId: string }>;
}): Promise<React.ReactElement> {
  const { roleId } = await params;
  const [role, permissionGroups] = await Promise.all([fetchPlatformRole(roleId), fetchPlatformPermissionGroups()]);
  if (!role) notFound();

  return (
    <PlatformPageShell
      title={role.name}
      description="Consultá el alcance y los permisos concedidos por este rol."
      breadcrumb={<PlatformBreadcrumb segmentLabels={{ roles: "Roles", [roleId]: role.name }} />}
      actions={
        role.editable || role.deletable ? (
          <div className="flex flex-wrap gap-3">
            {role.deletable ? (
              <PlatformRoleDeleteButton roleId={role.id} institutionId={role.institution.id} roleName={role.name} />
            ) : null}
            {role.editable ? (
              <Button asChild size="lg">
                <ReturnToLink href={`/admin/roles/${role.id}/edit`}>
                  <PencilIcon data-icon="inline-start" />
                  Editar rol
                </ReturnToLink>
              </Button>
            ) : null}
          </div>
        ) : undefined
      }
    >
      <div className="grid gap-4 md:grid-cols-4">
        <RoleSummaryCard icon={ShieldCheckIcon} label="Institución" value={role.institution.name} />
        <RoleSummaryCard
          icon={ShieldCheckIcon}
          label="Tipo de rol"
          value={role.technicalCode ? "Rol del sistema" : "Rol personalizado"}
        />
        <RoleSummaryCard icon={UsersIcon} label="Usuarios asignados" value={String(role.assignmentCount)} />
        <RoleSummaryCard icon={KeyRoundIcon} label="Permisos concedidos" value={String(role.permissions.length)} />
      </div>
      {!role.institution.active ? (
        <div className="text-muted-foreground rounded-lg border border-dashed p-4 text-sm">
          La institución está inactiva. Este rol se puede consultar, pero no modificar.
        </div>
      ) : null}
      <section className="flex flex-col gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold">Permisos del rol</h2>
            <Badge variant={role.technicalCode ? "secondary" : "outline"}>
              {role.technicalCode ? "Sistema" : "Personalizado"}
            </Badge>
          </div>
          <p className="text-muted-foreground text-sm">
            Los permisos están organizados por el área del portal que controlan.
          </p>
        </div>
        <InstitutionRolePermissions permissionCodes={role.permissions} groups={permissionGroups} />
      </section>
    </PlatformPageShell>
  );
}

function RoleSummaryCard({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof ShieldCheckIcon;
  label: string;
  value: string;
}): React.ReactElement {
  return (
    <Card className="bg-muted/25">
      <CardHeader className="flex-row items-center gap-3">
        <span className="bg-primary/10 text-primary flex size-10 shrink-0 items-center justify-center rounded-lg">
          <Icon className="size-5" />
        </span>
        <div className="flex min-w-0 flex-col gap-1">
          <CardDescription>{label}</CardDescription>
          <CardTitle className="truncate text-base">{value}</CardTitle>
        </div>
      </CardHeader>
    </Card>
  );
}
