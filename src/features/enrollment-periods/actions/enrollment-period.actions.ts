"use server";

import { revalidatePath } from "next/cache";
import {
  createEnrollmentPeriod,
  deleteEnrollmentPeriod,
  updateEnrollmentPeriod,
  updateEnrollmentPeriodStatus,
} from "../services/enrollment-period.service";
import type { CreateEnrollmentPeriodRequest, EnrollmentPeriodStatusRequest, UpdateEnrollmentPeriodRequest } from "../types/enrollment-period.types";

import { AcademicScope, type AcademicScope as AcademicScopeType } from "@features/academic/utils/academic-scope.util";

export async function createEnrollmentPeriodAction(
  institutionId: string,
  request: CreateEnrollmentPeriodRequest,
  scope: AcademicScopeType = AcademicScope.INSTITUTIONAL,
) {
  const result = await createEnrollmentPeriod(institutionId, request, scope);
  revalidatePath("/(institutional)/enrollment-periods");
  revalidatePath("/admin/enrollment-periods");
  return result;
}

export async function updateEnrollmentPeriodAction(
  institutionId: string,
  periodId: string,
  request: UpdateEnrollmentPeriodRequest,
  scope: AcademicScopeType = AcademicScope.INSTITUTIONAL,
) {
  const result = await updateEnrollmentPeriod(institutionId, periodId, request, scope);
  revalidatePath("/(institutional)/enrollment-periods");
  revalidatePath("/admin/enrollment-periods");
  return result;
}

export async function updateEnrollmentPeriodStatusAction(
  institutionId: string,
  periodId: string,
  request: EnrollmentPeriodStatusRequest,
  scope: AcademicScopeType = AcademicScope.INSTITUTIONAL,
) {
  await updateEnrollmentPeriodStatus(institutionId, periodId, request, scope);
  revalidatePath("/(institutional)/enrollment-periods");
  revalidatePath("/admin/enrollment-periods");
}

export async function deleteEnrollmentPeriodAction(institutionId: string, periodId: string, scope: AcademicScopeType = AcademicScope.INSTITUTIONAL) {
  await deleteEnrollmentPeriod(institutionId, periodId, scope);
  revalidatePath("/(institutional)/enrollment-periods");
  revalidatePath("/admin/enrollment-periods");
}
