"use client";

import * as React from "react";
import Link from "next/link";
import { useActionState } from "react";
import { BuildingIcon, CircleAlertIcon, InfoIcon, KeyRoundIcon, UserRoundCogIcon } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@common/components/ui/alert";
import { AsyncDropdown } from "@common/components/ui/async-dropdown";
import { Button } from "@common/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@common/components/ui/card";
import { Field, FieldError, FieldGroup, FieldLabel } from "@common/components/ui/field";
import { Input } from "@common/components/ui/input";
import type { AsyncDropdownFetchPageInput } from "@common/types/async-dropdown-fetch-page-input.types";
import type { AsyncDropdownPage } from "@common/types/async-dropdown-page.types";
import { parseHttpResponse } from "@common/utils/http-response-error.util";
import { buildPaginationSearchParams } from "@common/utils/pagination-query.util";
import { serializeSpringSort } from "@common/utils/sort-query.util";
import { savePlatformRoleAction } from "@features/roles/actions/save-platform-role.action";
import type { InstitutionSummary } from "@features/institutions/types/institution-summary.types";
import type { InstitutionPermissionGroup } from "@features/roles/types/institution-permission-group.types";
import type { PlatformRoleFormState } from "@features/roles/types/platform-role-form-state.types";
import type { PlatformRole } from "@features/roles/types/platform-role.types";
import { PermissionGroupsFields } from "@features/roles/components/permission-groups-fields";

const INITIAL_STATE: PlatformRoleFormState = {};
const INSTITUTION_QUERY_KEY = ["platform", "roles", "form-institutions"] as const;

type PlatformRoleFormProps = {
  role?: PlatformRole;
  permissionGroups: readonly InstitutionPermissionGroup[];
  returnTo?: string;
};

export function PlatformRoleForm({ role, permissionGroups, returnTo }: PlatformRoleFormProps): React.ReactElement {
  const destination = returnTo ?? (role ? `/admin/roles/${role.id}` : "/admin/roles");
  const action = savePlatformRoleAction.bind(null, role?.id, role?.institution.id, destination);
  const [state, formAction, pending] = useActionState(action, INITIAL_STATE);
  const isEdit = Boolean(role);

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
          <AlertTitle>Permisos protegidos</AlertTitle>
          <AlertDescription>Estos permisos se mantienen porque son necesarios para la administración institucional del rol.</AlertDescription>
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
            <Field data-invalid={Boolean(state.fieldErrors?.institutionId)} data-disabled={isEdit}>
              <FieldLabel htmlFor="platform-role-institution" required>
                Institución
              </FieldLabel>
              {role ? (
                <>
                  <div className="bg-muted flex h-9 items-center rounded-md border px-3 text-sm">
                    {role.institution.name}
                    {!role.institution.active ? " · Inactiva" : ""}
                  </div>
                  <input type="hidden" name="institutionId" value={role.institution.id} />
                </>
              ) : (
                <PlatformInstitutionDropdown ariaInvalid={Boolean(state.fieldErrors?.institutionId)} />
              )}
              <FieldError>{state.fieldErrors?.institutionId}</FieldError>
            </Field>
            <Field data-invalid={Boolean(state.fieldErrors?.name)}>
              <FieldLabel htmlFor="platform-role-name" required>
                Nombre
              </FieldLabel>
              <Input id="platform-role-name" name="name" defaultValue={role?.name} aria-invalid={Boolean(state.fieldErrors?.name)} maxLength={100} />
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
            inputIdPrefix="platform"
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

function PlatformInstitutionDropdown({ ariaInvalid }: { ariaInvalid: boolean }): React.ReactElement {
  const [institution, setInstitution] = React.useState<InstitutionSummary>();
  return (
    <AsyncDropdown<InstitutionSummary>
      ariaInvalid={ariaInvalid}
      id="platform-role-institution"
      name="institutionId"
      defaultOption={{ label: "Seleccionar institución", value: undefined }}
      emptyDescription="Todavía no se registraron instituciones en la plataforma."
      emptyIcon={BuildingIcon}
      emptyMessage="No se encontraron instituciones."
      emptyTitle="No hay instituciones"
      errorMessage="No se pudieron cargar las instituciones."
      fetchPage={fetchInstitutionPage}
      getItemLabel={(item) => item.name}
      getItemValue={(item) => item.id}
      onValueChange={(_value, item) => setInstitution(item)}
      placeholder="Seleccionar institución"
      queryKey={INSTITUTION_QUERY_KEY}
      searchPlaceholder="Buscar institución..."
      selectedLabel={institution?.name}
      value={institution?.id}
    />
  );
}

async function fetchInstitutionPage({ page, search, signal, size }: AsyncDropdownFetchPageInput): Promise<AsyncDropdownPage<InstitutionSummary>> {
  const params = buildPaginationSearchParams({ page, size, search });
  params.set("active", "true");
  params.set("sort", serializeSpringSort({ field: "name", direction: "asc" }));
  const response = await fetch(`/api/admin/institutions?${params.toString()}`, { signal });
  const data = await parseHttpResponse<{ items: InstitutionSummary[]; page: number; totalPages: number }>(
    response,
    "No se pudieron cargar las instituciones.",
  );
  return { items: data.items, nextPage: data.page + 1 < data.totalPages ? data.page + 1 : null };
}
