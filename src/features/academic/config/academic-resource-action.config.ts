import { z } from "zod";

import { getValidationActionState } from "@common/utils/action-state.util";
import { academicStatusSchema } from "@features/academic/schemas/academic-form.schema";
import type { AcademicActionState } from "@features/academic/types/academic-action-state.types";
import type { ActiveAcademicStatusResource } from "@features/academic/types/active-academic-status-resource.types";
import { AcademicResource } from "@features/academic/types/academic-resource.types";
import type { LifecycleResource } from "@features/academic/types/lifecycle-resource.types";
import type { ResourceActionConfig } from "@features/academic/types/resource-action-config.types";
import type { StatusResource } from "@features/academic/types/status-resource.types";
import { AcademicScope } from "@features/academic/utils/academic-scope.util";
import { INSTITUTIONAL_PERMISSION, type InstitutionalPermission } from "@features/institutional-auth/types/institutional-permission.types";

export const ACADEMIC_ACTION_FIELDS = [
  "institutionId",
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

export type ParsedFormData = Record<string, unknown>;

const directPath = (resource: AcademicResource) => (base: string) => `${base}/${resource}`;

export const RESOURCE_ACTION_CONFIG: Record<AcademicResource, ResourceActionConfig> = {
  [AcademicResource.ACADEMIC_YEAR]: {
    createPath: directPath(AcademicResource.ACADEMIC_YEAR),
    createPermission: INSTITUTIONAL_PERMISSION.ACADEMIC_YEAR_CREATE,
    updatePermission: INSTITUTIONAL_PERMISSION.ACADEMIC_YEAR_UPDATE,
  },
  [AcademicResource.TRAINING_PATH]: {
    createPath: directPath(AcademicResource.TRAINING_PATH),
    createPermission: INSTITUTIONAL_PERMISSION.TRAINING_PATH_CREATE,
    updatePermission: INSTITUTIONAL_PERMISSION.TRAINING_PATH_UPDATE,
    prepareBody: withoutActiveStatus,
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
    prepareBody: withoutActiveStatus,
  },
  [AcademicResource.INSTRUMENT]: {
    createPath: directPath(AcademicResource.INSTRUMENT),
    createPermission: INSTITUTIONAL_PERMISSION.INSTRUMENT_CREATE,
    updatePermission: INSTITUTIONAL_PERMISSION.INSTRUMENT_UPDATE,
    prepareBody: withoutActiveStatus,
  },
};

export const academicScopeSchema = z.enum([AcademicScope.ADMIN, AcademicScope.INSTITUTIONAL]);
export const academicResourceSchema = z.enum(AcademicResource);
export const statusResourceSchema = z.enum([
  AcademicResource.ACADEMIC_YEAR,
  AcademicResource.TRAINING_PATH,
  AcademicResource.STUDY_PLAN,
  AcademicResource.ACADEMIC_SPACE,
  AcademicResource.INSTRUMENT,
]);

export const STATUS_PERMISSIONS: Record<StatusResource, InstitutionalPermission> = {
  [AcademicResource.ACADEMIC_YEAR]: INSTITUTIONAL_PERMISSION.ACADEMIC_YEAR_STATUS_UPDATE,
  [AcademicResource.TRAINING_PATH]: INSTITUTIONAL_PERMISSION.TRAINING_PATH_STATUS_UPDATE,
  [AcademicResource.STUDY_PLAN]: INSTITUTIONAL_PERMISSION.STUDY_PLAN_STATUS_UPDATE,
  [AcademicResource.ACADEMIC_SPACE]: INSTITUTIONAL_PERMISSION.ACADEMIC_SPACE_STATUS_UPDATE,
  [AcademicResource.INSTRUMENT]: INSTITUTIONAL_PERMISSION.INSTRUMENT_STATUS_UPDATE,
};

export const deletableResourceSchema = z.enum([
  AcademicResource.ACADEMIC_YEAR,
  AcademicResource.TRAINING_PATH,
  AcademicResource.STUDY_PLAN,
  AcademicResource.ACADEMIC_SPACE,
  AcademicResource.INSTRUMENT,
  AcademicResource.ACADEMIC_LEVEL,
  AcademicResource.STUDY_PLAN_SPACE,
  AcademicResource.PREREQUISITE,
]);

export const restorableResourceSchema = z.enum([
  AcademicResource.ACADEMIC_YEAR,
  AcademicResource.TRAINING_PATH,
  AcademicResource.STUDY_PLAN,
  AcademicResource.ACADEMIC_SPACE,
  AcademicResource.INSTRUMENT,
]);

export const DELETE_PERMISSIONS: Record<LifecycleResource, InstitutionalPermission> = {
  [AcademicResource.ACADEMIC_YEAR]: INSTITUTIONAL_PERMISSION.ACADEMIC_YEAR_DELETE,
  [AcademicResource.TRAINING_PATH]: INSTITUTIONAL_PERMISSION.TRAINING_PATH_DELETE,
  [AcademicResource.STUDY_PLAN]: INSTITUTIONAL_PERMISSION.STUDY_PLAN_DELETE,
  [AcademicResource.ACADEMIC_SPACE]: INSTITUTIONAL_PERMISSION.ACADEMIC_SPACE_DELETE,
  [AcademicResource.INSTRUMENT]: INSTITUTIONAL_PERMISSION.INSTRUMENT_DELETE,
};

export const RESTORE_PERMISSIONS: Record<LifecycleResource, InstitutionalPermission> = {
  [AcademicResource.ACADEMIC_YEAR]: INSTITUTIONAL_PERMISSION.ACADEMIC_YEAR_RESTORE,
  [AcademicResource.TRAINING_PATH]: INSTITUTIONAL_PERMISSION.TRAINING_PATH_RESTORE,
  [AcademicResource.STUDY_PLAN]: INSTITUTIONAL_PERMISSION.STUDY_PLAN_RESTORE,
  [AcademicResource.ACADEMIC_SPACE]: INSTITUTIONAL_PERMISSION.ACADEMIC_SPACE_RESTORE,
  [AcademicResource.INSTRUMENT]: INSTITUTIONAL_PERMISSION.INSTRUMENT_RESTORE,
};

export const actionContextSchema = z.object({
  scope: academicScopeSchema,
  institutionId: z.uuid(),
  resource: academicResourceSchema,
  id: z.uuid().optional(),
  parentId: z.uuid().optional(),
  returnTo: z.string().optional(),
});

export const STATUS_INPUT_BUILDERS: Record<StatusResource, (formData: FormData) => Record<string, unknown>> = {
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

export function activeStatusInput(resource: ActiveAcademicStatusResource): (formData: FormData) => Record<string, unknown> {
  return (formData) => ({ resource, active: formData.get("active") });
}

export function withoutActiveStatus(data: ParsedFormData): ParsedFormData {
  return Object.fromEntries(Object.entries(data).filter(([field]) => field !== "active"));
}

export function isValidActiveStatusValue(value: FormDataEntryValue | null): value is "true" | "false" {
  return value === "true" || value === "false";
}

export function isFormStatusResource(
  resource: AcademicResource,
): resource is AcademicResource.TRAINING_PATH | AcademicResource.ACADEMIC_SPACE | AcademicResource.INSTRUMENT {
  return resource === AcademicResource.TRAINING_PATH || resource === AcademicResource.ACADEMIC_SPACE || resource === AcademicResource.INSTRUMENT;
}

export function getStatusRequestBody(data: z.infer<typeof academicStatusSchema>): Record<string, unknown> {
  if ("active" in data) return { active: data.active };
  if ("effectiveTo" in data) return { status: data.status, effectiveTo: data.effectiveTo };
  return { status: data.status };
}

export function invalidActionState(): AcademicActionState {
  return { error: "La solicitud académica no tiene un formato válido." };
}

export function resolveCatalogStatusChange(
  resource: AcademicResource,
  id: string | undefined,
  formData: FormData,
): { error?: AcademicActionState; nextActiveStatus: "true" | "false" | null; formStatusResource: ActiveAcademicStatusResource | null } {
  const activeStatusValue = formData.get("active");
  const initialActiveStatusValue = formData.get("initialActive");
  const nextActiveStatus = isValidActiveStatusValue(activeStatusValue) ? activeStatusValue : null;
  const formStatusResource = isFormStatusResource(resource) ? resource : null;
  const hasCatalogStatus = Boolean(id && formStatusResource && formData.has("active"));

  if (hasCatalogStatus && !isValidActiveStatusValue(activeStatusValue)) {
    return {
      error: getValidationActionState([{ path: ["active"], message: "Seleccioná un estado válido." }], ACADEMIC_ACTION_FIELDS),
      nextActiveStatus: null,
      formStatusResource: null,
    };
  }

  const shouldUpdate =
    hasCatalogStatus &&
    nextActiveStatus !== null &&
    isValidActiveStatusValue(initialActiveStatusValue) &&
    nextActiveStatus !== initialActiveStatusValue;

  return {
    nextActiveStatus: shouldUpdate ? nextActiveStatus : null,
    formStatusResource,
  };
}
