"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { getResponseErrorActionState, getValidationActionState } from "@common/utils/action-state.util";
import { getSafeReturnTo } from "@common/utils/return-to.util";
import { academicStatusSchema, parseAcademicForm } from "@features/academic/schemas/academic-form.schema";
import { academicApiFetch } from "@features/academic/services/academic-api-fetch.service";
import type { AcademicActionState } from "@features/academic/types/academic-action-state.types";
import type { ActiveAcademicStatusResource } from "@features/academic/types/active-academic-status-resource.types";
import { AcademicResource } from "@features/academic/types/academic-resource.types";
import {
  getAcademicApiBase,
  getAcademicResourceRoute,
  AcademicScope,
  type AcademicScope as AcademicScopeType,
} from "@features/academic/utils/academic-scope.util";
import { requireInstitutionalUser } from "@features/institutional-auth/services/get-institutional-user.service";
import {
  INSTITUTIONAL_PERMISSION,
  type InstitutionalPermission,
} from "@features/institutional-auth/types/institutional-permission.types";
import { hasInstitutionalPermission } from "@features/institutional-auth/utils/institutional-permission.util";
import { requirePlatformAccount } from "@features/platform-auth/services/get-platform-account.service";

const FIELDS = [
  "name",
  "trainingPathId",
  "description",
  "year",
  "status",
  "active",
  "startDate",
  "endDate",
  "effectiveFrom",
  "effectiveTo",
  "displayOrder",
  "type",
  "academicSpaceId",
  "academicLevelId",
  "requirementType",
  "approvalMode",
  "requiredStudyPlanSpaceId",
  "requirementStage",
  "requiredCondition",
] as const;

type ParsedFormData = Record<string, unknown>;

type ResourceActionConfig = {
  createPath: (base: string, parentId: string | undefined, data: ParsedFormData) => string;
  createPermission: InstitutionalPermission;
  updatePermission: InstitutionalPermission;
  prepareBody?: (data: ParsedFormData) => ParsedFormData;
};

const directPath = (resource: AcademicResource) => (base: string) => `${base}/${resource}`;
const RESOURCE_ACTION_CONFIG: Record<AcademicResource, ResourceActionConfig> = {
  [AcademicResource.ACADEMIC_YEAR]: {
    createPath: directPath(AcademicResource.ACADEMIC_YEAR),
    createPermission: INSTITUTIONAL_PERMISSION.ACADEMIC_YEAR_CREATE,
    updatePermission: INSTITUTIONAL_PERMISSION.ACADEMIC_YEAR_UPDATE,
  },
  [AcademicResource.TRAINING_PATH]: {
    createPath: directPath(AcademicResource.TRAINING_PATH),
    createPermission: INSTITUTIONAL_PERMISSION.TRAINING_PATH_CREATE,
    updatePermission: INSTITUTIONAL_PERMISSION.TRAINING_PATH_UPDATE,
  },
  [AcademicResource.STUDY_PLAN]: {
    createPath: (base, parentId, data) => `${base}/training-paths/${parentId ?? data.trainingPathId}/study-plans`,
    createPermission: INSTITUTIONAL_PERMISSION.STUDY_PLAN_CREATE,
    updatePermission: INSTITUTIONAL_PERMISSION.STUDY_PLAN_UPDATE,
    prepareBody: (data) => Object.fromEntries(Object.entries(data).filter(([field]) => field !== "trainingPathId")),
  },
  [AcademicResource.ACADEMIC_LEVEL]: {
    createPath: (base, parentId) => `${base}/study-plans/${parentId}/academic-levels`,
    createPermission: INSTITUTIONAL_PERMISSION.STUDY_PLAN_CURRICULUM_UPDATE,
    updatePermission: INSTITUTIONAL_PERMISSION.STUDY_PLAN_CURRICULUM_UPDATE,
  },
  [AcademicResource.STUDY_PLAN_SPACE]: {
    createPath: (base, parentId) => `${base}/study-plans/${parentId}/spaces`,
    createPermission: INSTITUTIONAL_PERMISSION.STUDY_PLAN_CURRICULUM_UPDATE,
    updatePermission: INSTITUTIONAL_PERMISSION.STUDY_PLAN_CURRICULUM_UPDATE,
  },
  [AcademicResource.PREREQUISITE]: {
    createPath: (base, parentId) => `${base}/study-plan-spaces/${parentId}/prerequisites`,
    createPermission: INSTITUTIONAL_PERMISSION.STUDY_PLAN_CURRICULUM_UPDATE,
    updatePermission: INSTITUTIONAL_PERMISSION.STUDY_PLAN_CURRICULUM_UPDATE,
  },
  [AcademicResource.ACADEMIC_SPACE]: {
    createPath: directPath(AcademicResource.ACADEMIC_SPACE),
    createPermission: INSTITUTIONAL_PERMISSION.ACADEMIC_SPACE_CREATE,
    updatePermission: INSTITUTIONAL_PERMISSION.ACADEMIC_SPACE_UPDATE,
  },
  [AcademicResource.INSTRUMENT]: {
    createPath: directPath(AcademicResource.INSTRUMENT),
    createPermission: INSTITUTIONAL_PERMISSION.INSTRUMENT_CREATE,
    updatePermission: INSTITUTIONAL_PERMISSION.INSTRUMENT_UPDATE,
  },
};

type StatusResource =
  | AcademicResource.ACADEMIC_YEAR
  | AcademicResource.TRAINING_PATH
  | AcademicResource.STUDY_PLAN
  | AcademicResource.ACADEMIC_SPACE
  | AcademicResource.INSTRUMENT;

const academicScopeSchema = z.enum([AcademicScope.ADMIN, AcademicScope.INSTITUTIONAL]);
const academicResourceSchema = z.enum(AcademicResource);
const statusResourceSchema = z.enum([
  AcademicResource.ACADEMIC_YEAR,
  AcademicResource.TRAINING_PATH,
  AcademicResource.STUDY_PLAN,
  AcademicResource.ACADEMIC_SPACE,
  AcademicResource.INSTRUMENT,
]);
const STATUS_PERMISSIONS: Record<StatusResource, InstitutionalPermission> = {
  [AcademicResource.ACADEMIC_YEAR]: INSTITUTIONAL_PERMISSION.ACADEMIC_YEAR_STATUS_UPDATE,
  [AcademicResource.TRAINING_PATH]: INSTITUTIONAL_PERMISSION.TRAINING_PATH_STATUS_UPDATE,
  [AcademicResource.STUDY_PLAN]: INSTITUTIONAL_PERMISSION.STUDY_PLAN_STATUS_UPDATE,
  [AcademicResource.ACADEMIC_SPACE]: INSTITUTIONAL_PERMISSION.ACADEMIC_SPACE_STATUS_UPDATE,
  [AcademicResource.INSTRUMENT]: INSTITUTIONAL_PERMISSION.INSTRUMENT_STATUS_UPDATE,
};
const deletableResourceSchema = z.enum([
  AcademicResource.ACADEMIC_YEAR,
  AcademicResource.TRAINING_PATH,
  AcademicResource.STUDY_PLAN,
  AcademicResource.ACADEMIC_SPACE,
  AcademicResource.INSTRUMENT,
  AcademicResource.ACADEMIC_LEVEL,
  AcademicResource.STUDY_PLAN_SPACE,
  AcademicResource.PREREQUISITE,
]);
const restorableResourceSchema = z.enum([
  AcademicResource.ACADEMIC_YEAR,
  AcademicResource.TRAINING_PATH,
  AcademicResource.STUDY_PLAN,
  AcademicResource.ACADEMIC_SPACE,
  AcademicResource.INSTRUMENT,
]);
type LifecycleResource = z.infer<typeof restorableResourceSchema>;
const DELETE_PERMISSIONS: Record<LifecycleResource, InstitutionalPermission> = {
  [AcademicResource.ACADEMIC_YEAR]: INSTITUTIONAL_PERMISSION.ACADEMIC_YEAR_DELETE,
  [AcademicResource.TRAINING_PATH]: INSTITUTIONAL_PERMISSION.TRAINING_PATH_DELETE,
  [AcademicResource.STUDY_PLAN]: INSTITUTIONAL_PERMISSION.STUDY_PLAN_DELETE,
  [AcademicResource.ACADEMIC_SPACE]: INSTITUTIONAL_PERMISSION.ACADEMIC_SPACE_DELETE,
  [AcademicResource.INSTRUMENT]: INSTITUTIONAL_PERMISSION.INSTRUMENT_DELETE,
};
const RESTORE_PERMISSIONS: Record<LifecycleResource, InstitutionalPermission> = {
  [AcademicResource.ACADEMIC_YEAR]: INSTITUTIONAL_PERMISSION.ACADEMIC_YEAR_RESTORE,
  [AcademicResource.TRAINING_PATH]: INSTITUTIONAL_PERMISSION.TRAINING_PATH_RESTORE,
  [AcademicResource.STUDY_PLAN]: INSTITUTIONAL_PERMISSION.STUDY_PLAN_RESTORE,
  [AcademicResource.ACADEMIC_SPACE]: INSTITUTIONAL_PERMISSION.ACADEMIC_SPACE_RESTORE,
  [AcademicResource.INSTRUMENT]: INSTITUTIONAL_PERMISSION.INSTRUMENT_RESTORE,
};
const actionContextSchema = z.object({
  scope: academicScopeSchema,
  institutionId: z.uuid(),
  resource: academicResourceSchema,
  id: z.uuid().optional(),
  parentId: z.uuid().optional(),
  returnTo: z.string().optional(),
});

const STATUS_INPUT_BUILDERS: Record<StatusResource, (formData: FormData) => Record<string, unknown>> = {
  [AcademicResource.ACADEMIC_YEAR]: (formData) => ({
    resource: AcademicResource.ACADEMIC_YEAR,
    status: formData.get("status"),
  }),
  [AcademicResource.STUDY_PLAN]: (formData) => ({
    resource: AcademicResource.STUDY_PLAN,
    status: formData.get("status"),
    effectiveFrom: formData.get("effectiveFrom") ?? "",
    effectiveTo: formData.get("effectiveTo") ?? "",
  }),
  [AcademicResource.TRAINING_PATH]: activeStatusInput(AcademicResource.TRAINING_PATH),
  [AcademicResource.ACADEMIC_SPACE]: activeStatusInput(AcademicResource.ACADEMIC_SPACE),
  [AcademicResource.INSTRUMENT]: activeStatusInput(AcademicResource.INSTRUMENT),
};

export async function saveAcademicResourceAction(
  scope: AcademicScopeType,
  institutionId: string,
  resource: AcademicResource,
  id: string | undefined,
  parentId: string | undefined,
  returnTo: string | undefined,
  _state: AcademicActionState,
  formData: FormData,
): Promise<AcademicActionState> {
  const context = actionContextSchema.safeParse({ scope, institutionId, resource, id, parentId, returnTo });
  if (!context.success) return invalidActionState();

  const config = RESOURCE_ACTION_CONFIG[context.data.resource];
  const requiredPermission = context.data.id ? config.updatePermission : config.createPermission;
  const authorizationError = await authorize(context.data.scope, context.data.institutionId, requiredPermission);
  if (authorizationError) return authorizationError;

  const parsed = parseAcademicForm(context.data.resource, formData);
  if (!parsed.success) return getValidationActionState(parsed.error.issues, FIELDS);

  const data = parsed.data as ParsedFormData;
  const apiBase = getAcademicApiBase(context.data.scope, context.data.institutionId);
  const path = context.data.id
    ? `${apiBase}/${context.data.resource}/${context.data.id}`
    : config.createPath(apiBase, context.data.parentId, data);
  const body = config.prepareBody?.(data) ?? data;
  const error = await getResponseErrorActionState(
    academicApiFetch(context.data.scope, path, {
      method: context.data.id ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }),
    FIELDS,
    "No se pudo guardar la configuración académica.",
  );
  if (error) return error;

  const fallback = getAcademicResourceRoute(context.data.scope, context.data.institutionId, context.data.resource);
  revalidatePath(fallback);
  redirect(getSafeReturnTo(context.data.returnTo, fallback));
}

export async function updateAcademicStatusAction(
  scope: AcademicScopeType,
  institutionId: string,
  resource: StatusResource,
  id: string,
  returnTo: string | undefined,
  _state: AcademicActionState,
  formData: FormData,
): Promise<AcademicActionState> {
  const context = actionContextSchema.extend({ resource: statusResourceSchema, id: z.uuid() }).safeParse({
    scope,
    institutionId,
    resource,
    id,
    returnTo,
  });
  if (!context.success) return invalidActionState();

  const authorizationError = await authorize(
    context.data.scope,
    context.data.institutionId,
    STATUS_PERMISSIONS[context.data.resource],
  );
  if (authorizationError) return authorizationError;

  const raw = STATUS_INPUT_BUILDERS[context.data.resource](formData);
  const parsed = academicStatusSchema.safeParse(raw);
  if (!parsed.success) return getValidationActionState(parsed.error.issues, FIELDS);

  const body = getStatusRequestBody(parsed.data);
  const path = `${getAcademicApiBase(context.data.scope, context.data.institutionId)}/${context.data.resource}/${context.data.id}/status`;
  const error = await getResponseErrorActionState(
    academicApiFetch(context.data.scope, path, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }),
    FIELDS,
    "No se pudo actualizar el estado.",
  );
  if (error) return error;

  const fallback = getAcademicResourceRoute(context.data.scope, context.data.institutionId, context.data.resource);
  revalidatePath(fallback);
  redirect(getSafeReturnTo(context.data.returnTo, fallback));
}

export async function deleteAcademicResourceAction(
  scope: AcademicScopeType,
  institutionId: string,
  resource:
    | AcademicResource.ACADEMIC_YEAR
    | AcademicResource.TRAINING_PATH
    | AcademicResource.STUDY_PLAN
    | AcademicResource.ACADEMIC_SPACE
    | AcademicResource.INSTRUMENT
    | AcademicResource.ACADEMIC_LEVEL
    | AcademicResource.STUDY_PLAN_SPACE
    | AcademicResource.PREREQUISITE,
  id: string,
  destination: string,
  _state: AcademicActionState,
  _formData: FormData,
): Promise<AcademicActionState> {
  void _state;
  void _formData;
  const context = actionContextSchema
    .extend({ resource: deletableResourceSchema, id: z.uuid(), destination: z.string() })
    .safeParse({ scope, institutionId, resource, id, destination });
  if (!context.success) return invalidActionState();

  const permission = restorableResourceSchema.safeParse(context.data.resource).success
    ? DELETE_PERMISSIONS[context.data.resource as LifecycleResource]
    : INSTITUTIONAL_PERMISSION.STUDY_PLAN_CURRICULUM_UPDATE;
  const authorizationError = await authorize(context.data.scope, context.data.institutionId, permission);
  if (authorizationError) return authorizationError;

  const error = await getResponseErrorActionState(
    academicApiFetch(
      context.data.scope,
      `${getAcademicApiBase(context.data.scope, context.data.institutionId)}/${context.data.resource}/${context.data.id}`,
      { method: "DELETE" },
    ),
    FIELDS,
    "No se pudo eliminar el elemento.",
  );
  if (error) return error;

  const fallback = getAcademicResourceRoute(context.data.scope, context.data.institutionId, context.data.resource);
  revalidatePath(fallback);
  redirect(getSafeReturnTo(context.data.destination, fallback));
}

export async function restoreAcademicResourceAction(
  scope: AcademicScopeType,
  institutionId: string,
  resource: LifecycleResource,
  id: string,
  destination: string,
  _state: AcademicActionState,
  _formData: FormData,
): Promise<AcademicActionState> {
  void _state;
  void _formData;
  const context = actionContextSchema
    .extend({ resource: restorableResourceSchema, id: z.uuid(), destination: z.string() })
    .safeParse({ scope, institutionId, resource, id, destination });
  if (!context.success) return invalidActionState();

  const authorizationError = await authorize(
    context.data.scope,
    context.data.institutionId,
    RESTORE_PERMISSIONS[context.data.resource],
  );
  if (authorizationError) return authorizationError;

  const apiBase = getAcademicApiBase(context.data.scope, context.data.institutionId);
  const error = await getResponseErrorActionState(
    academicApiFetch(context.data.scope, `${apiBase}/${context.data.resource}/${context.data.id}/restore`, {
      method: "POST",
    }),
    FIELDS,
    "No se pudo restaurar el elemento.",
  );
  if (error) return error;

  const fallback = getAcademicResourceRoute(context.data.scope, context.data.institutionId, context.data.resource);
  revalidatePath(fallback);
  redirect(getSafeReturnTo(context.data.destination, fallback));
}

async function authorize(
  scope: AcademicScopeType,
  institutionId: string,
  permission: InstitutionalPermission,
): Promise<AcademicActionState | undefined> {
  if (AcademicScope.isAdmin(scope)) {
    await requirePlatformAccount();
    return undefined;
  }

  const user = await requireInstitutionalUser();
  const belongsToInstitution = user.institutionId === institutionId;
  const hasPermission = hasInstitutionalPermission(user, permission);
  if (belongsToInstitution && hasPermission) return undefined;
  return { error: "No tenés permisos para modificar esta configuración académica." };
}

function activeStatusInput(resource: ActiveAcademicStatusResource): (formData: FormData) => Record<string, unknown> {
  return (formData) => ({ resource, active: formData.get("active") });
}

function getStatusRequestBody(data: z.infer<typeof academicStatusSchema>): Record<string, unknown> {
  if ("active" in data) return { active: data.active };
  if ("effectiveTo" in data) return { status: data.status, effectiveTo: data.effectiveTo };
  return { status: data.status };
}

function invalidActionState(): AcademicActionState {
  return { error: "La solicitud académica no tiene un formato válido." };
}
