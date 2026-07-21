import { notFound } from "next/navigation";
import { KeyRoundIcon, PencilIcon, UserLockIcon, UsersIcon } from "lucide-react";

import { Badge } from "@common/components/ui/badge";
import { Button } from "@common/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@common/components/ui/card";
import { ReturnToLink } from "@common/components/navigation/return-to-link";
import { InstitutionalAccessDenied } from "@features/institutional-auth/components/institutional-access-denied";
import { InstitutionalBreadcrumb } from "@features/institutional-auth/components/institutional-breadcrumb";
import { requireInstitutionalUser } from "@features/institutional-auth/services/get-institutional-user.service";
import { INSTITUTIONAL_PERMISSION } from "@features/institutional-auth/types/institutional-permission.types";
import { hasInstitutionalPermission } from "@features/institutional-auth/utils/institutional-permission.util";
import { PlatformPageShell } from "@features/platform-auth/components/platform-page-shell";
import { InstitutionRoleDeleteButton } from "@features/roles/components/institution-role-delete-button";
import { InstitutionRolePermissions } from "@features/roles/components/institution-role-permissions";
import {
  fetchInstitutionPermissionGroups,
  fetchInstitutionRole,
} from "@features/roles/services/institution-role.service";

import type { Metadata } from "next";
import { getInstitutionalMetadata } from "@features/institutional-auth/utils/institutional-metadata.util";

export async function generateMetadata(): Promise<Metadata> {
  return getInstitutionalMetadata("Detalle del rol");
}

export default async function RoleDetailPage({
  params,
}: {
  params: Promise<{ roleId: string }>;
}): Promise<React.ReactElement> {
  const { roleId } = await params;
  const user = await requireInstitutionalUser();
  if (!hasInstitutionalPermission(user, INSTITUTIONAL_PERMISSION.ROLE_READ)) {
    return <InstitutionalAccessDenied />;
  }

  const [role, permissionGroups] = await Promise.all([
    fetchInstitutionRole(user.institutionId, roleId),
    fetchInstitutionPermissionGroups(user.institutionId),
  ]);
  if (!role) notFound();

  const canUpdate = role.editable && hasInstitutionalPermission(user, INSTITUTIONAL_PERMISSION.ROLE_UPDATE);
  const canDelete = role.deletable && hasInstitutionalPermission(user, INSTITUTIONAL_PERMISSION.ROLE_DELETE);

  return (
    <PlatformPageShell
      title={role.name}
      description="Consultá el alcance y los permisos concedidos por este rol."
      breadcrumb={<InstitutionalBreadcrumb segmentLabels={{ [roleId]: role.name }} />}
      actions={
        canUpdate || canDelete ? (
          <div className="flex flex-wrap gap-3">
            {canDelete ? (
              <InstitutionRoleDeleteButton institutionId={user.institutionId} roleId={role.id} roleName={role.name} />
            ) : null}
            {canUpdate ? (
              <Button asChild size="lg">
                <ReturnToLink href={`/roles/${role.id}/edit`}>
                  <PencilIcon data-icon="inline-start" />
                  Editar rol
                </ReturnToLink>
              </Button>
            ) : null}
          </div>
        ) : undefined
      }
    >
      <div className="grid gap-4 md:grid-cols-3">
        <RoleSummaryCard
          icon={UserLockIcon}
          label="Tipo de rol"
          value={role.technicalCode ? "Rol del sistema" : "Rol personalizado"}
        />
        <RoleSummaryCard icon={UsersIcon} label="Usuarios asignados" value={String(role.assignmentCount)} />
        <RoleSummaryCard icon={KeyRoundIcon} label="Permisos concedidos" value={String(role.permissions.length)} />
      </div>

      <section className="flex flex-col gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold">Permisos del rol</h2>
            {role.technicalCode ? (
              <Badge variant="secondary">Sistema</Badge>
            ) : (
              <Badge variant="outline">Personalizado</Badge>
            )}
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

type RoleSummaryCardProps = {
  icon: typeof UserLockIcon;
  label: string;
  value: string;
};

function RoleSummaryCard({ icon: Icon, label, value }: RoleSummaryCardProps): React.ReactElement {
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
