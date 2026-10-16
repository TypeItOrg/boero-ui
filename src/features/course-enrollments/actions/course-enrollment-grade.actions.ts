"use server";

import { revalidatePath } from "next/cache";

import { INVALID_ACTION_ARGUMENTS, isValidUuid } from "@common/utils/action-argument.util";
import { getResponseErrorActionState } from "@common/utils/action-state.util";

import { courseEnrollmentGradeSchema } from "@features/course-enrollments/schemas/course-enrollment-grade.schema";
import { requireInstitutionalUser } from "@features/institutional-auth/services/get-institutional-user.service";
import { institutionalApiFetch } from "@features/institutional-auth/services/institutional-api-fetch.service";

type GradeActionResult = { error?: string; draft?: boolean; pending?: boolean };

type GradeFormBody = { evaluation: string; value: number };

function parseGradeForm(formData: FormData): GradeFormBody | null {
  const parsed = courseEnrollmentGradeSchema.safeParse({
    evaluation: formData.get("evaluation"),
    value: formData.get("value"),
  });

  if (!parsed.success) {
    return null;
  }

  return parsed.data;
}

function isValidVersion(value: unknown): value is number {
  return Number.isInteger(value) && (value as number) >= 0;
}

function revalidateGradePaths(): void {
  revalidatePath("/course-enrollments");
  revalidatePath("/my-teaching");
  revalidatePath("/my-course-enrollments");
}

async function sendGradeRequest(path: string, init: RequestInit, fallbackMessage: string): Promise<GradeActionResult> {
  const user = await requireInstitutionalUser();

  const response = institutionalApiFetch(`/api/v1/institutions/${user.institutionId}${path}`, init);

  const failure = await getResponseErrorActionState(response, [], fallbackMessage);

  if (failure) {
    return { error: failure.error };
  }

  revalidateGradePaths();

  return {};
}

async function saveGrade(path: string, formData: FormData, extraBody?: Record<string, unknown>): Promise<GradeActionResult> {
  const body = parseGradeForm(formData);

  if (!body) {
    return { error: "Revisá la evaluación y la nota (1 a 10, hasta 2 decimales)." };
  }

  const isUpdate = extraBody !== undefined;

  const result = await sendGradeRequest(
    path,
    {
      method: isUpdate ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...body, ...extraBody }),
    },
    "No se pudo guardar la nota.",
  );

  if (result.error) {
    return result;
  }

  return isUpdate ? { pending: true } : { draft: true };
}

export async function createInstitutionalGradeAction(enrollmentId: string, formData: FormData): Promise<GradeActionResult> {
  if (!isValidUuid(enrollmentId)) {
    return { error: INVALID_ACTION_ARGUMENTS };
  }

  return saveGrade(`/course-enrollments/${enrollmentId}/grades`, formData);
}

export async function updateInstitutionalGradeAction(
  enrollmentId: string,
  gradeId: string,
  expectedVersion: number,
  formData: FormData,
): Promise<GradeActionResult> {
  if (!isValidUuid(enrollmentId) || !isValidUuid(gradeId) || !isValidVersion(expectedVersion)) {
    return { error: INVALID_ACTION_ARGUMENTS };
  }

  return saveGrade(`/course-enrollments/${enrollmentId}/grades/${gradeId}`, formData, {
    expectedVersion,
  });
}

export async function deleteInstitutionalGradeAction(enrollmentId: string, gradeId: string, expectedVersion?: number): Promise<GradeActionResult> {
  if (!isValidUuid(enrollmentId) || !isValidUuid(gradeId) || (expectedVersion !== undefined && !isValidVersion(expectedVersion))) {
    return { error: INVALID_ACTION_ARGUMENTS };
  }

  const params = expectedVersion !== undefined ? `?expectedVersion=${expectedVersion}` : "";

  return sendGradeRequest(`/course-enrollments/${enrollmentId}/grades/${gradeId}${params}`, { method: "DELETE" }, "No se pudo eliminar la nota.");
}

export async function cancelInstitutionalGradeDeletionAction(enrollmentId: string, gradeId: string): Promise<GradeActionResult> {
  if (!isValidUuid(enrollmentId) || !isValidUuid(gradeId)) {
    return { error: INVALID_ACTION_ARGUMENTS };
  }

  return sendGradeRequest(
    `/course-enrollments/${enrollmentId}/grades/${gradeId}/cancel-deletion`,
    { method: "POST" },
    "No se pudo deshacer la eliminación.",
  );
}

export async function publishInstitutionalGradesAction(classId: string): Promise<GradeActionResult> {
  if (!isValidUuid(classId)) {
    return { error: INVALID_ACTION_ARGUMENTS };
  }

  return sendGradeRequest(`/course-classes/${classId}/grades/publish`, { method: "POST" }, "No se pudieron publicar las notas.");
}

export async function createTeacherGradeAction(classId: string, enrollmentId: string, formData: FormData): Promise<GradeActionResult> {
  if (!isValidUuid(classId) || !isValidUuid(enrollmentId)) {
    return { error: INVALID_ACTION_ARGUMENTS };
  }

  return saveGrade(`/teacher/classes/${classId}/enrollments/${enrollmentId}/grades`, formData);
}

export async function updateTeacherGradeAction(
  classId: string,
  enrollmentId: string,
  gradeId: string,
  expectedVersion: number,
  formData: FormData,
): Promise<GradeActionResult> {
  if (!isValidUuid(classId) || !isValidUuid(enrollmentId) || !isValidUuid(gradeId) || !isValidVersion(expectedVersion)) {
    return { error: INVALID_ACTION_ARGUMENTS };
  }

  return saveGrade(`/teacher/classes/${classId}/enrollments/${enrollmentId}/grades/${gradeId}`, formData, { expectedVersion });
}

export async function deleteTeacherGradeAction(
  classId: string,
  enrollmentId: string,
  gradeId: string,
  expectedVersion?: number,
): Promise<GradeActionResult> {
  if (
    !isValidUuid(classId) ||
    !isValidUuid(enrollmentId) ||
    !isValidUuid(gradeId) ||
    (expectedVersion !== undefined && !isValidVersion(expectedVersion))
  ) {
    return { error: INVALID_ACTION_ARGUMENTS };
  }

  const params = expectedVersion !== undefined ? `?expectedVersion=${expectedVersion}` : "";

  return sendGradeRequest(
    `/teacher/classes/${classId}/enrollments/${enrollmentId}/grades/${gradeId}${params}`,
    { method: "DELETE" },
    "No se pudo eliminar la nota.",
  );
}

export async function cancelTeacherGradeDeletionAction(classId: string, enrollmentId: string, gradeId: string): Promise<GradeActionResult> {
  if (!isValidUuid(classId) || !isValidUuid(enrollmentId) || !isValidUuid(gradeId)) {
    return { error: INVALID_ACTION_ARGUMENTS };
  }

  return sendGradeRequest(
    `/teacher/classes/${classId}/enrollments/${enrollmentId}/grades/${gradeId}/cancel-deletion`,
    { method: "POST" },
    "No se pudo deshacer la eliminación.",
  );
}

export async function publishTeacherGradesAction(classId: string): Promise<GradeActionResult> {
  if (!isValidUuid(classId)) {
    return { error: INVALID_ACTION_ARGUMENTS };
  }

  return sendGradeRequest(`/teacher/classes/${classId}/grades/publish`, { method: "POST" }, "No se pudieron publicar las notas.");
}
