"use server";

import { ENROLLMENT_PERIOD_STATUS } from "@features/enrollment-periods/types/enrollment-period-status.types";
import { ENROLLMENT_MESSAGES } from "@features/enrollment-applications/constants/enrollment-messages.constants";
import { revalidatePath } from "next/cache";
import { authorizeAcademicAction } from "@features/academic/utils/academic-action-auth.util";
import { INSTITUTIONAL_PERMISSION, type InstitutionalPermission } from "@features/institutional-auth/types/institutional-permission.types";
import { z } from "zod";
import { getResponseErrorActionState } from "@common/utils/action-state.util";
import { academicApiFetch } from "@features/academic/services/academic-api-fetch.service";
import type { CreateEnrollmentPeriodRequest } from "@features/enrollment-periods/types/create-enrollment-period-request.types";
import type { UpdateEnrollmentPeriodRequest } from "@features/enrollment-periods/types/update-enrollment-period-request.types";
import type { EnrollmentPeriodStatusRequest } from "@features/enrollment-periods/types/enrollment-period-status-request.types";
import type { EnrollmentPeriodActionState } from "@features/enrollment-periods/types/enrollment-period-action-state.types";
import { AcademicScope } from "@features/academic/utils/academic-scope.util";

const contextSchema = z.object({
  institutionId: z.uuid(),
  periodId: z.uuid().optional(),
  scope: z.enum([AcademicScope.INSTITUTIONAL, AcademicScope.ADMIN]),
});

const detailsSchema = z
  .object({
    offerings: z
      .array(
        z
          .object({
            studyPlanId: z.uuid(),
            academicLevelIds: z.array(z.uuid()),
            includeUnassigned: z.boolean(),
          })
          .refine((offering) => offering.academicLevelIds.length > 0 || offering.includeUnassigned, ENROLLMENT_MESSAGES.PERIOD_SCOPE_REQUIRED),
      )
      .min(1, ENROLLMENT_MESSAGES.PERIOD_SCOPE_REQUIRED),
    name: z.string().trim().min(1, ENROLLMENT_MESSAGES.PERIOD_NAME_REQUIRED).max(150),
    startDate: z.iso.datetime({ offset: true }),
    endDate: z.iso.datetime({ offset: true }),
  })
  .refine((data) => Date.parse(data.startDate) <= Date.parse(data.endDate), ENROLLMENT_MESSAGES.PERIOD_DATES_INVALID);

async function mutate(
  institutionId: string,
  periodId: string | undefined,
  scope: AcademicScope,
  permission: InstitutionalPermission,
  method: string,
  body?: unknown,
  suffix = "",
): Promise<EnrollmentPeriodActionState> {
  if (!contextSchema.safeParse({ institutionId, periodId, scope }).success) {
    return { error: ENROLLMENT_MESSAGES.PERIOD_INPUT_INVALID };
  }

  const authError = await authorizeAcademicAction(scope, institutionId, permission);

  if (authError) {
    return { error: authError.error };
  }

  const path = `/api/v1/institutions/${institutionId}/enrollment-periods${periodId ? "/" + periodId : ""}${suffix}`;
  const error = await getResponseErrorActionState(
    academicApiFetch(scope, path, {
      method,
      headers: { "Content-Type": "application/json" },
      body: body === undefined ? undefined : JSON.stringify(body),
    }),
    [],
    ENROLLMENT_MESSAGES.PERIOD_SAVE_FAILED,
  );

  if (error) {
    return { error: error.error };
  }

  revalidatePath("/enrollment-periods");
  revalidatePath("/admin/enrollment-periods");
  revalidatePath("/my-enrollment-applications", "layout");
  revalidatePath("/enrollment-applications", "layout");
  revalidatePath("/admin/enrollment-applications", "layout");

  return { success: true };
}

export async function createEnrollmentPeriodAction(
  institutionId: string,
  request: CreateEnrollmentPeriodRequest,
  scope: AcademicScope = AcademicScope.INSTITUTIONAL,
): Promise<EnrollmentPeriodActionState> {
  const parsed = detailsSchema.safeExtend({ academicYearId: z.uuid() }).safeParse(request);

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  return mutate(institutionId, undefined, scope, INSTITUTIONAL_PERMISSION.ENROLLMENT_PERIOD_CREATE, "POST", parsed.data);
}

export async function updateEnrollmentPeriodAction(
  institutionId: string,
  periodId: string,
  request: UpdateEnrollmentPeriodRequest,
  scope: AcademicScope = AcademicScope.INSTITUTIONAL,
): Promise<EnrollmentPeriodActionState> {
  if (!z.uuid().safeParse(periodId).success) {
    return { error: ENROLLMENT_MESSAGES.PERIOD_ID_INVALID };
  }

  const parsed = detailsSchema.safeParse(request);

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  return mutate(institutionId, periodId, scope, INSTITUTIONAL_PERMISSION.ENROLLMENT_PERIOD_UPDATE, "PUT", parsed.data);
}

export async function updateEnrollmentPeriodStatusAction(
  institutionId: string,
  periodId: string,
  request: EnrollmentPeriodStatusRequest,
  scope: AcademicScope = AcademicScope.INSTITUTIONAL,
): Promise<EnrollmentPeriodActionState> {
  if (!z.uuid().safeParse(periodId).success) {
    return { error: ENROLLMENT_MESSAGES.PERIOD_ID_INVALID };
  }

  const parsed = z.object({ status: z.enum(ENROLLMENT_PERIOD_STATUS) }).safeParse(request);

  if (!parsed.success) {
    return { error: ENROLLMENT_MESSAGES.PERIOD_STATUS_INVALID };
  }

  return mutate(institutionId, periodId, scope, INSTITUTIONAL_PERMISSION.ENROLLMENT_PERIOD_STATUS_UPDATE, "PATCH", parsed.data, "/status");
}

export async function deleteEnrollmentPeriodAction(
  institutionId: string,
  periodId: string,
  scope: AcademicScope = AcademicScope.INSTITUTIONAL,
): Promise<EnrollmentPeriodActionState> {
  if (!z.uuid().safeParse(periodId).success) {
    return { error: ENROLLMENT_MESSAGES.PERIOD_ID_INVALID };
  }

  return mutate(institutionId, periodId, scope, INSTITUTIONAL_PERMISSION.ENROLLMENT_PERIOD_DELETE, "DELETE");
}
