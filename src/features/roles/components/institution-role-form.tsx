"use client";

import { useActionState } from "react";
import Link from "next/link";
import { CircleAlertIcon, InfoIcon } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@common/components/ui/alert";
import { Button } from "@common/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@common/components/ui/card";
import { Checkbox } from "@common/components/ui/checkbox";
import { Field, FieldError, FieldGroup, FieldLabel } from "@common/components/ui/field";
import { Input } from "@common/components/ui/input";
import { saveInstitutionRoleAction } from "../actions/save-institution-role.action";
import type { InstitutionPermissionGroup, InstitutionRole, RoleFormState } from "../types/institution-role.types";

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
            Solo podés delegar permisos que ya poseés. Los demás se muestran bloqueados.
          </p>
        </div>
        <div className="flex flex-wrap items-stretch gap-4">
          {permissionGroups.map((group) => (
            <Card key={group.code} className="bg-muted/25 flex-[1_0_min(450px,100%)]">
              <CardHeader>
                <CardTitle>{group.displayName}</CardTitle>
                <CardDescription>{group.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                {group.permissions.map((permission) => (
                  <RolePermissionField
                    key={permission.code}
                    permission={permission}
                    checked={role?.permissions.includes(permission.code)}
                    protectedPermission={role?.protectedPermissions.includes(permission.code)}
                  />
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
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

type RolePermissionFieldProps = {
  permission: InstitutionPermissionGroup["permissions"][number];
  checked?: boolean;
  protectedPermission?: boolean;
};

function RolePermissionField({
  permission,
  checked,
  protectedPermission,
}: RolePermissionFieldProps): React.ReactElement {
  const disabled = !permission.grantable || protectedPermission;

  return (
    <>
      {protectedPermission ? <input type="hidden" name="permissions" value={permission.code} /> : null}
      <Field orientation="horizontal" data-disabled={disabled}>
        <Checkbox
          id={permission.code}
          name="permissions"
          value={permission.code}
          defaultChecked={checked}
          disabled={disabled}
        />
        <FieldLabel htmlFor={permission.code} className="font-normal">
          {permission.description}
        </FieldLabel>
      </Field>
    </>
  );
}
