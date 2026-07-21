import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRightIcon, KeyRoundIcon, PlusIcon, UserLockIcon, UsersIcon } from "lucide-react";

import { ReturnToLink } from "@common/components/navigation/return-to-link";
import { Badge } from "@common/components/ui/badge";
import { Button } from "@common/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@common/components/ui/card";
import { InstitutionalAccessDenied } from "@features/institutional-auth/components/institutional-access-denied";
import { InstitutionalBreadcrumb } from "@features/institutional-auth/components/institutional-breadcrumb";
import { requireInstitutionalUser } from "@features/institutional-auth/services/get-institutional-user.service";
import { INSTITUTIONAL_PERMISSION } from "@features/institutional-auth/types/institutional-permission.types";
import { getInstitutionalMetadata } from "@features/institutional-auth/utils/institutional-metadata.util";
import { hasInstitutionalPermission } from "@features/institutional-auth/utils/institutional-permission.util";
import { PlatformPageShell } from "@features/platform-auth/components/platform-page-shell";
import { fetchInstitutionRoles } from "@features/roles/services/institution-role.service";

export async function generateMetadata(): Promise<Metadata> {
  return getInstitutionalMetadata("Roles");
}

export default async function RolesPage(): Promise<React.ReactElement> {
  const user = await requireInstitutionalUser();
  if (!hasInstitutionalPermission(user, INSTITUTIONAL_PERMISSION.ROLE_READ)) {
    return <InstitutionalAccessDenied />;
  }
  const roles = await fetchInstitutionRoles(user.institutionId);
  const canCreate = hasInstitutionalPermission(user, INSTITUTIONAL_PERMISSION.ROLE_CREATE);
  const canUpdate = hasInstitutionalPermission(user, INSTITUTIONAL_PERMISSION.ROLE_UPDATE);

  return (
    <PlatformPageShell
      title="Roles"
      description="Definí las responsabilidades y accesos de tu equipo."
      breadcrumb={<InstitutionalBreadcrumb />}
      actions={
        canCreate ? (
          <Button asChild size="lg">
            <ReturnToLink href="/roles/new">
              <PlusIcon data-icon="inline-start" />
              Nuevo rol
            </ReturnToLink>
          </Button>
        ) : undefined
      }
    >
      <div className="flex flex-wrap items-start gap-4">
        {roles.map((role) => (
          <Card key={role.id} className="bg-muted/25 flex-[1_0_min(450px,100%)] overflow-hidden">
            <CardHeader className="flex-row items-center gap-3">
              <span className="bg-primary/10 text-primary flex size-10 shrink-0 items-center justify-center rounded-lg">
                <UserLockIcon className="size-5" />
              </span>
              <div className="flex min-w-0 flex-1 flex-col gap-1">
                <div className="flex items-center gap-2">
                  <CardTitle className="truncate">{role.name}</CardTitle>
                  {role.technicalCode ? (
                    <Badge variant="secondary">Sistema</Badge>
                  ) : (
                    <Badge variant="outline">Personalizado</Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-3">
              <div className="bg-background/70 flex items-center gap-2 rounded-lg border p-3">
                <UsersIcon className="text-muted-foreground size-4" />
                <span className="text-sm font-medium">
                  {role.assignmentCount} {role.assignmentCount === 1 ? "usuario" : "usuarios"}
                </span>
              </div>
              <div className="bg-background/70 flex items-center gap-2 rounded-lg border p-3">
                <KeyRoundIcon className="text-muted-foreground size-4" />
                <span className="text-sm font-medium">
                  {role.permissions.length} {role.permissions.length === 1 ? "permiso" : "permisos"}
                </span>
              </div>
            </CardContent>
            <CardFooter className="bg-background/50 flex items-center justify-end gap-2 border-t">
              {canUpdate && role.editable ? (
                <Button asChild variant="ghost" size="lg">
                  <ReturnToLink href={`/roles/${role.id}/edit`}>Editar</ReturnToLink>
                </Button>
              ) : (
                <Button disabled variant="ghost" size="lg">
                  Editar
                </Button>
              )}
              <Button asChild size="lg">
                <Link href={`/roles/${role.id}`}>Ver detalle</Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </PlatformPageShell>
  );
}
