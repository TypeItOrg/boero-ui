"use client";

import { useActionState } from "react";
import Link from "next/link";
import { CircleAlertIcon, InfoIcon, KeyRoundIcon, UserRoundCogIcon } from "lucide-react";

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
        <CardHeader className="border-b">
          <div className="flex items-center gap-3.5">
            <div className="bg-primary/10 text-primary flex aspect-square min-h-11 min-w-11 shrink-0 items-center justify-center self-stretch rounded-xl">
              <UserRoundCogIcon className="size-5" aria-hidden="true" />
            </div>
            <div>
              <CardTitle>Datos del rol</CardTitle>
              <CardDescription>Usá un nombre reconocible para las personas de la institución.</CardDescription>
            </div>
          </div>
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

      <section className="bg-muted/25 rounded-xl border p-5 md:p-6">
        <header className="-mx-5 border-b px-5 pb-5 md:-mx-6 md:px-6">
          <div className="flex items-center gap-3.5">
            <div className="bg-primary/10 text-primary flex aspect-square min-h-11 min-w-11 shrink-0 items-center justify-center self-stretch rounded-xl">
              <KeyRoundIcon className="size-5" aria-hidden="true" />
            </div>
            <div>
              <h2 className="text-base font-semibold">Permisos</h2>
              <p className="text-muted-foreground text-sm">Seleccioná los permisos que podrá conceder este rol.</p>
            </div>
          </div>
        </header>
        <div className="mt-5">
          <PermissionGroupsFields
            groups={permissionGroups}
            selectedPermissions={role?.permissions}
            protectedPermissions={role?.protectedPermissions}
          />
        </div>
      </section>

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
