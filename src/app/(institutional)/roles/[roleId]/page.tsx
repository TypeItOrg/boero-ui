import { notFound } from "next/navigation";
import Link from "next/link";
import { KeyRoundIcon, ShieldCheckIcon, UserLockIcon, UsersIcon, type LucideIcon } from "lucide-react";

import { Badge } from "@common/components/ui/badge";
import { Button } from "@common/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@common/components/ui/card";
import type { QueryParamValue } from "@common/types/query-param.types";
import { ReturnToLink } from "@common/components/navigation/return-to-link";
import { getSafeReturnTo } from "@common/utils/return-to.util";
import { InstitutionalAccessDenied } from "@features/institutional-auth/components/institutional-access-denied";
import { InstitutionalBreadcrumb } from "@features/institutional-auth/components/institutional-breadcrumb";
import { requireInstitutionalUser } from "@features/institutional-auth/services/get-institutional-user.service";
import { INSTITUTIONAL_PERMISSION } from "@features/institutional-auth/types/institutional-permission.types";
import { hasInstitutionalPermission } from "@features/institutional-auth/utils/institutional-permission.util";
import { PlatformPageShell } from "@features/platform-auth/components/platform-page-shell";
import { InstitutionRoleDeleteButton } from "@features/roles/components/institution-role-delete-button";
import { InstitutionRolePermissions } from "@features/roles/components/institution-role-permissions";
import { fetchInstitutionPermissionGroups, fetchInstitutionRole } from "@features/roles/services/institution-role.service";

import type { Metadata } from "next";
import { getInstitutionalMetadata } from "@features/institutional-auth/utils/institutional-metadata.util";

export async function generateMetadata(): Promise<Metadata> {
  return getInstitutionalMetadata("Detalle del rol");
}

export default async function RoleDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ roleId: string }>;
  searchParams: Promise<{ returnTo?: QueryParamValue }>;
}): Promise<React.ReactElement> {
  const [{ roleId }, { returnTo }] = await Promise.all([params, searchParams]);
  const destination = getSafeReturnTo(returnTo, "/roles");
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
      breadcrumb={<InstitutionalBreadcrumb segmentLabels={{ [roleId]: role.name }} />}
      headerClassName="flex-row items-center justify-between"
      actionsClassName="self-stretch"
      actions={
        <div className="flex h-full items-center gap-3">
          <div className="from-primary to-primary/80 text-primary-foreground hidden h-full min-h-12 w-12 items-center justify-center rounded-2xl bg-linear-to-br shadow-xs sm:flex">
            <ShieldCheckIcon className="size-6 sm:size-7" aria-hidden="true" />
          </div>
        </div>
      }
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button asChild variant="outline" size="lg">
          <Link href={destination}>Volver</Link>
        </Button>
        <div className="flex flex-wrap justify-end gap-3">
          {canDelete ? <InstitutionRoleDeleteButton institutionId={user.institutionId} roleId={role.id} roleName={role.name} /> : null}
          {canUpdate ? (
            <Button asChild size="lg">
              <ReturnToLink href={`/roles/${role.id}/edit`} returnTo={destination}>
                Editar rol
              </ReturnToLink>
            </Button>
          ) : (
            <Button disabled size="lg">
              Editar rol
            </Button>
          )}
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <RoleSummaryCard
          icon={UserLockIcon}
          label="Tipo de rol"
          value={<Badge variant={role.technicalCode ? "secondary" : "outline"}>{role.technicalCode ? "Sistema" : "Personalizado"}</Badge>}
        />
        <RoleSummaryCard icon={UsersIcon} label="Usuarios asignados" value={String(role.assignmentCount)} />
        <RoleSummaryCard icon={KeyRoundIcon} label="Permisos concedidos" value={String(role.permissions.length)} />
      </div>

      <Card className="bg-background gap-0 pb-0">
        <CardHeader className="border-b">
          <div className="flex items-stretch gap-3.5">
            <div className="bg-primary/10 text-primary flex aspect-square min-h-11 min-w-11 shrink-0 items-center justify-center self-stretch rounded-xl">
              <KeyRoundIcon className="size-5" aria-hidden="true" />
            </div>
            <div className="flex min-w-0 flex-col justify-center">
              <CardTitle>Permisos del rol</CardTitle>
              <CardDescription>Los permisos están organizados por el área del portal que controlan.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          <InstitutionRolePermissions permissionCodes={role.permissions} groups={permissionGroups} />
        </CardContent>
      </Card>
    </PlatformPageShell>
  );
}

type RoleSummaryCardProps = {
  icon: LucideIcon;
  label: string;
  value: React.ReactNode;
};

function RoleSummaryCard({ icon: Icon, label, value }: RoleSummaryCardProps): React.ReactElement {
  return (
    <Card className="bg-muted/25">
      <CardHeader className="flex-row items-center gap-3">
        <span className="bg-primary/10 text-primary flex size-10 shrink-0 items-center justify-center rounded-lg">
          <Icon className="size-5" aria-hidden="true" />
        </span>
        <div className="flex min-w-0 flex-col gap-1">
          <CardDescription>{label}</CardDescription>
          <CardTitle className="line-clamp-1 text-base">{value}</CardTitle>
        </div>
      </CardHeader>
    </Card>
  );
}
