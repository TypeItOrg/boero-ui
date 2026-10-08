import { z } from "zod";

import { getValidationActionState } from "@common/utils/action-state.util";

import { ACADEMIC_ACTION_FIELDS } from "@features/academic/constants/academic-action-fields.constants";
import { academicStatusSchema } from "@features/academic/schemas/academic-form.schema";
import type { AcademicActionState } from "@features/academic/types/academic-action-state.types";
import { AcademicResource } from "@features/academic/types/academic-resource.types";
import type { ActiveAcademicStatusResource } from "@features/academic/types/active-academic-status-resource.types";
import { type ParsedFormData } from "@features/academic/types/parsed-academic-form-data.types";
import type { StatusResource } from "@features/academic/types/status-resource.types";
import { INSTITUTIONAL_PERMISSION, type InstitutionalPermission } from "@features/institutional-auth/types/institutional-permission.types";

export const statusResourceSchema = z.enum([
  AcademicResource.ACADEMIC_YEAR,
  AcademicResource.TRAINING_PATH,
  AcademicResource.STUDY_PLAN,
  AcademicResource.ACADEMIC_SPACE,
  AcademicResource.INSTRUMENT,
  AcademicResource.COURSE,
  AcademicResource.SHIFT,
]);

export const STATUS_PERMISSIONS: Record<StatusResource, InstitutionalPermission> = {
  [AcademicResource.ACADEMIC_YEAR]: INSTITUTIONAL_PERMISSION.ACADEMIC_YEAR_STATUS_UPDATE,
  [AcademicResource.TRAINING_PATH]: INSTITUTIONAL_PERMISSION.TRAINING_PATH_STATUS_UPDATE,
  [AcademicResource.STUDY_PLAN]: INSTITUTIONAL_PERMISSION.STUDY_PLAN_STATUS_UPDATE,
  [AcademicResource.ACADEMIC_SPACE]: INSTITUTIONAL_PERMISSION.ACADEMIC_SPACE_STATUS_UPDATE,
  [AcademicResource.INSTRUMENT]: INSTITUTIONAL_PERMISSION.INSTRUMENT_STATUS_UPDATE,
  [AcademicResource.COURSE]: INSTITUTIONAL_PERMISSION.COURSE_STATUS_UPDATE,
  [AcademicResource.SHIFT]: INSTITUTIONAL_PERMISSION.SHIFT_STATUS_UPDATE,
};

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
  [AcademicResource.COURSE]: (formData) => ({
    resource: AcademicResource.COURSE,
    status: formData.get("status"),
  }),
  [AcademicResource.SHIFT]: activeStatusInput(AcademicResource.SHIFT),
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

export function isFormStatusResource(resource: AcademicResource): resource is ActiveAcademicStatusResource {
  return (
    resource === AcademicResource.TRAINING_PATH ||
    resource === AcademicResource.ACADEMIC_SPACE ||
    resource === AcademicResource.INSTRUMENT ||
    resource === AcademicResource.SHIFT
  );
}

export function getStatusRequestBody(data: z.infer<typeof academicStatusSchema>): Record<string, unknown> {
  if ("active" in data) {
    return { active: data.active };
  }

  if ("effectiveTo" in data) {
    return { status: data.status, effectiveTo: data.effectiveTo };
  }

  return { status: data.status };
}

export function resolveCatalogStatusChange(
  resource: AcademicResource,
  id: string | undefined,
  formData: FormData,
): {
  error?: AcademicActionState;
  nextActiveStatus: "true" | "false" | null;
  formStatusResource: ActiveAcademicStatusResource | null;
} {
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
