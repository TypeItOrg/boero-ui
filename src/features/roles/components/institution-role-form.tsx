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
import type {
  InstitutionPermissionGroup,
  InstitutionRole,
  RoleFormState,
} from "@features/roles/types/institution-role.types";

type InstitutionRoleFormProps = {
  role?: InstitutionRole;
  permissionGroups: readonly InstitutionPermissionGroup[];
  cancelHref?: string;
};

const initialState: RoleFormState = {};

export function InstitutionRoleForm({
  role,
  permissionGroups,
  cancelHref = "/roles",
}: InstitutionRoleFormProps): React.ReactElement {
  const action = saveInstitutionRoleAction.bind(null, role?.id);
  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-5">
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
        <Button asChild variant="outline" size="lg">
          <Link href={cancelHref}>Cancelar</Link>
        </Button>
        <Button type="submit" size="lg" disabled={pending}>
          {pending ? "Guardando…" : "Guardar cambios"}
        </Button>
      </div>
    </form>
  );
}
