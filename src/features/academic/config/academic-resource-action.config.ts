import { z } from "zod";

import { withoutActiveStatus } from "@features/academic/config/academic-status-action.config";
import { AcademicResource } from "@features/academic/types/academic-resource.types";
import type { ResourceActionConfig } from "@features/academic/types/resource-action-config.types";
import { AcademicScope } from "@features/academic/utils/academic-scope.util";
import { INSTITUTIONAL_PERMISSION } from "@features/institutional-auth/types/institutional-permission.types";

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
    prepareBody: (data) => Object.fromEntries(Object.entries(data).filter(([field]) => field !== "trainingPathId" && field !== "status")),
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
  [AcademicResource.COURSE]: {
    createPath: directPath(AcademicResource.COURSE),
    createPermission: INSTITUTIONAL_PERMISSION.COURSE_CREATE,
    updatePermission: INSTITUTIONAL_PERMISSION.COURSE_UPDATE,
    updatePath: (base, id) => `${base}/courses/${id}/classes`,
    prepareBody: (data) => ({
      studyPlanSpaceId: data.studyPlanSpaceId,
      instrumentId: data.instrumentId,
      studyPlanId: data.studyPlanId,
      academicSpaceId: data.academicSpaceId,
      academicYearId: data.academicYearId,
      classes: data.classes,
    }),
  },
  [AcademicResource.SHIFT]: {
    createPath: directPath(AcademicResource.SHIFT),
    createPermission: INSTITUTIONAL_PERMISSION.SHIFT_CREATE,
    updatePermission: INSTITUTIONAL_PERMISSION.SHIFT_UPDATE,
    prepareBody: withoutActiveStatus,
  },
};

export const academicScopeSchema = z.enum([AcademicScope.ADMIN, AcademicScope.INSTITUTIONAL]);

export const academicResourceSchema = z.enum(AcademicResource);

export const actionContextSchema = z.object({
  scope: academicScopeSchema,
  institutionId: z.uuid(),
  resource: academicResourceSchema,
  id: z.uuid().optional(),
  parentId: z.uuid().optional(),
  returnTo: z.string().optional(),
});

export { deletableResourceSchema } from "@features/academic/config/academic-lifecycle-action.config";

export { restorableResourceSchema } from "@features/academic/config/academic-lifecycle-action.config";

export { DELETE_PERMISSIONS } from "@features/academic/config/academic-lifecycle-action.config";

export { RESTORE_PERMISSIONS } from "@features/academic/config/academic-lifecycle-action.config";

export { statusResourceSchema } from "@features/academic/config/academic-status-action.config";

export { STATUS_PERMISSIONS } from "@features/academic/config/academic-status-action.config";

export { STATUS_INPUT_BUILDERS } from "@features/academic/config/academic-status-action.config";

export { activeStatusInput } from "@features/academic/config/academic-status-action.config";

export { withoutActiveStatus } from "@features/academic/config/academic-status-action.config";

export { isValidActiveStatusValue } from "@features/academic/config/academic-status-action.config";

export { isFormStatusResource } from "@features/academic/config/academic-status-action.config";

export { getStatusRequestBody } from "@features/academic/config/academic-status-action.config";

export { resolveCatalogStatusChange } from "@features/academic/config/academic-status-action.config";

export type { ParsedFormData } from "@features/academic/types/parsed-academic-form-data.types";

export { invalidActionState } from "@features/academic/utils/invalid-academic-action-state.util";

export { ACADEMIC_ACTION_FIELDS } from "@features/academic/constants/academic-action-fields.constants";
