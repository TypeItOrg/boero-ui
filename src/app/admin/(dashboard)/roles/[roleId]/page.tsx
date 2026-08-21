import { notFound } from "next/navigation";
import Link from "next/link";
import { KeyRoundIcon, ShieldCheckIcon, UsersIcon, type LucideIcon } from "lucide-react";

import { Badge } from "@common/components/ui/badge";
import { Button } from "@common/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@common/components/ui/card";
import { cn } from "@common/utils/cn.util";
import type { QueryParamValue } from "@common/types/query-param.types";
import { getSafeReturnTo } from "@common/utils/return-to.util";
import { ReturnToLink } from "@common/components/navigation/return-to-link";
import { PlatformBreadcrumb } from "@features/platform-auth/components/platform-breadcrumb";
import { PlatformPageShell } from "@features/platform-auth/components/platform-page-shell";
import { InstitutionRolePermissions } from "@features/roles/components/institution-role-permissions";
import { PlatformRoleDeleteButton } from "@features/roles/components/platform-role-delete-button";
import { fetchPlatformPermissionGroups, fetchPlatformRole } from "@features/roles/services/platform-role.service";

export const metadata = { title: "Detalle del rol" };

export default async function PlatformRoleDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ roleId: string }>;
  searchParams: Promise<{ returnTo?: QueryParamValue }>;
}): Promise<React.ReactElement> {
  const [{ roleId }, { returnTo }] = await Promise.all([params, searchParams]);
  const destination = getSafeReturnTo(returnTo, "/admin/roles");
  const [role, permissionGroups] = await Promise.all([fetchPlatformRole(roleId), fetchPlatformPermissionGroups()]);
  if (!role) notFound();

  return (
    <PlatformPageShell
      title={role.name}
      breadcrumb={<PlatformBreadcrumb segmentLabels={{ roles: "Roles", [roleId]: role.name }} />}
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
          {role.deletable ? <PlatformRoleDeleteButton roleId={role.id} institutionId={role.institution.id} roleName={role.name} /> : null}
          {role.editable ? (
            <Button asChild size="lg">
              <ReturnToLink href={`/admin/roles/${role.id}/edit`} returnTo={destination}>
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
      <div className="grid gap-4 sm:grid-cols-3 xl:grid-cols-4">
        <RoleSummaryCard
          icon={ShieldCheckIcon}
          label="Institución"
          value={role.institution.name}
          title={role.institution.name}
          className="sm:col-span-3 xl:col-span-1"
        />
        <RoleSummaryCard
          icon={ShieldCheckIcon}
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

function RoleSummaryCard({
  icon: Icon,
  label,
  value,
  title,
  className,
}: {
  icon: LucideIcon;
  label: string;
  value: React.ReactNode;
  title?: string;
  className?: string;
}): React.ReactElement {
  return (
    <Card className={cn("bg-muted/25", className)}>
      <CardHeader className="flex-row items-center gap-3">
        <span className="bg-primary/10 text-primary flex size-10 shrink-0 items-center justify-center rounded-lg">
          <Icon className="size-5" aria-hidden="true" />
        </span>
        <div className="flex min-w-0 flex-col gap-1">
          <CardDescription>{label}</CardDescription>
          <CardTitle className="line-clamp-1 text-base" title={title}>
            {value}
          </CardTitle>
        </div>
      </CardHeader>
    </Card>
  );
}
