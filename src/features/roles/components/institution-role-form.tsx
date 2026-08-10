"use client";

import { useActionState } from "react";
import Link from "next/link";
import { CircleAlertIcon, InfoIcon } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@common/components/ui/alert";
import { Button } from "@common/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@common/components/ui/card";
import { Field, FieldError, FieldGroup, FieldLabel } from "@common/components/ui/field";
import { Input } from "@common/components/ui/input";
import { saveInstitutionRoleAction } from "@features/roles/actions/save-institution-role.action";
import { PermissionGroupsFields } from "@features/roles/components/permission-groups-fields";
import type { InstitutionPermissionGroup } from "@features/roles/types/institution-permission-group.types";
import type { InstitutionRole } from "@features/roles/types/institution-role.types";
import type { RoleFormState } from "@features/roles/types/role-form-state.types";

type InstitutionRoleFormProps = {
  institutionId: string;
  role?: InstitutionRole;
  permissionGroups: readonly InstitutionPermissionGroup[];
  returnTo?: string;
};

const initialState: RoleFormState = {};

export function InstitutionRoleForm({
  institutionId,
  role,
  permissionGroups,
  returnTo,
}: InstitutionRoleFormProps): React.ReactElement {
  const destination = returnTo ?? (role ? `/roles/${role.id}` : "/roles");
  const action = saveInstitutionRoleAction.bind(null, institutionId, role?.id, destination);
  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      {state.error ? (
        <Alert variant="destructive">
          <CircleAlertIcon />
          <AlertTitle>No se pudo guardar el rol</AlertTitle>
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      ) : null}

      {role?.protectedPermissions.length ? (
        <Alert>
          <InfoIcon />
          <AlertTitle>Permisos necesarios para administrar roles</AlertTitle>
          <AlertDescription>
            Los permisos bloqueados no se pueden quitar porque actualmente te permiten consultar y actualizar roles.
          </AlertDescription>
        </Alert>
      ) : null}

      <Card className="bg-muted/25">
        <CardHeader>
          <CardTitle>Datos del rol</CardTitle>
          <CardDescription>Usá un nombre reconocible para las personas de la institución.</CardDescription>
        </CardHeader>
        <CardContent>
          <FieldGroup>
            <Field data-invalid={Boolean(state.fieldErrors?.name)}>
              <FieldLabel htmlFor="name" required>
                Nombre
              </FieldLabel>
              <Input
                id="name"
                name="name"
                defaultValue={role?.name}
                aria-invalid={Boolean(state.fieldErrors?.name)}
                maxLength={100}
              />
              <FieldError>{state.fieldErrors?.name}</FieldError>
            </Field>
          </FieldGroup>
        </CardContent>
      </Card>

      <div className="flex flex-col gap-4">
        <div>
          <h2 className="text-lg font-semibold">Permisos</h2>
          <p className="text-muted-foreground text-sm">
            Solo podés delegar permisos que ya poseés. Los permisos de consulta requeridos se agregan automáticamente.
          </p>
        </div>
        <PermissionGroupsFields
          groups={permissionGroups}
          selectedPermissions={role?.permissions}
          protectedPermissions={role?.protectedPermissions}
        />
      </div>

      <div className="flex justify-end gap-3">
        <Button asChild variant="outline" size="lg" className="flex-1 sm:flex-none">
          <Link href={destination}>Cancelar</Link>
        </Button>
        <Button type="submit" size="lg" disabled={pending} className="flex-1 sm:flex-none">
          {pending ? "Guardando…" : "Guardar cambios"}
        </Button>
      </div>
    </form>
  );
}
