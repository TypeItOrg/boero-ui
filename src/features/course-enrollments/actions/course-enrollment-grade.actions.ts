"use server";

import { INVALID_ACTION_ARGUMENTS, isValidUuid } from "@common/utils/action-argument.util";
import { getResponseErrorActionState } from "@common/utils/action-state.util";
import { courseEnrollmentGradeSchema } from "@features/course-enrollments/schemas/course-enrollment-grade.schema";
import { requireInstitutionalUser } from "@features/institutional-auth/services/get-institutional-user.service";
import { institutionalApiFetch } from "@features/institutional-auth/services/institutional-api-fetch.service";
import { revalidatePath } from "next/cache";

type GradeActionResult = { error?: string; draft?: boolean; pending?: boolean };

function parseGradeForm(formData: FormData): { evaluation: string; value: number } | null {
  const parsed = courseEnrollmentGradeSchema.safeParse({
    evaluation: formData.get("evaluation"),
    value: formData.get("value"),
  });

  if (!parsed.success) {
    return null;
  }

  return parsed.data;
}

export async function createInstitutionalGradeAction(enrollmentId: string, formData: FormData): Promise<GradeActionResult> {
  if (!isValidUuid(enrollmentId)) {
    return { error: INVALID_ACTION_ARGUMENTS };
  }

  const body = parseGradeForm(formData);

  if (!body) {
    return { error: "Revisá la evaluación y la nota (1 a 10, hasta 2 decimales)." };
  }

  const user = await requireInstitutionalUser();
  const response = institutionalApiFetch(`/api/v1/institutions/${user.institutionId}/course-enrollments/${enrollmentId}/grades`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const failure = await getResponseErrorActionState(response, [], "No se pudo guardar la nota.");

  if (failure) {
    return { error: failure.error };
  }

  revalidatePath("/course-enrollments");
  revalidatePath("/my-course-enrollments");
  return { draft: true };
}

export async function updateInstitutionalGradeAction(
  enrollmentId: string,
  gradeId: string,
  expectedVersion: number,
  formData: FormData,
): Promise<GradeActionResult> {
  if (!isValidUuid(enrollmentId) || !isValidUuid(gradeId) || !Number.isInteger(expectedVersion) || expectedVersion < 0) {
    return { error: INVALID_ACTION_ARGUMENTS };
  }

  const body = parseGradeForm(formData);

  if (!body) {
    return { error: "Revisá la evaluación y la nota (1 a 10, hasta 2 decimales)." };
  }

  const user = await requireInstitutionalUser();
  const response = institutionalApiFetch(
    `/api/v1/institutions/${user.institutionId}/course-enrollments/${enrollmentId}/grades/${gradeId}`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...body, expectedVersion }),
    },
  );
  const failure = await getResponseErrorActionState(response, [], "No se pudo guardar la nota.");

  if (failure) {
    return { error: failure.error };
  }

  revalidatePath("/course-enrollments");
  revalidatePath("/my-course-enrollments");
  return { pending: true };
}

export async function deleteInstitutionalGradeAction(
  enrollmentId: string,
  gradeId: string,
  expectedVersion?: number,
): Promise<GradeActionResult> {
  if (
    !isValidUuid(enrollmentId) ||
    !isValidUuid(gradeId) ||
    (expectedVersion !== undefined && (!Number.isInteger(expectedVersion) || expectedVersion < 0))
  ) {
    return { error: INVALID_ACTION_ARGUMENTS };
  }

  const user = await requireInstitutionalUser();
  const params = expectedVersion !== undefined ? `?expectedVersion=${expectedVersion}` : "";
  const response = institutionalApiFetch(
    `/api/v1/institutions/${user.institutionId}/course-enrollments/${enrollmentId}/grades/${gradeId}${params}`,
    { method: "DELETE" },
  );
  const failure = await getResponseErrorActionState(response, [], "No se pudo eliminar la nota.");

  if (failure) {
    return { error: failure.error };
  }

  revalidatePath("/course-enrollments");
  revalidatePath("/my-teaching");
  revalidatePath("/my-course-enrollments");
  return {};
}

export async function cancelInstitutionalGradeDeletionAction(enrollmentId: string, gradeId: string): Promise<GradeActionResult> {
  if (!isValidUuid(enrollmentId) || !isValidUuid(gradeId)) {
    return { error: INVALID_ACTION_ARGUMENTS };
  }

  const user = await requireInstitutionalUser();
  const response = institutionalApiFetch(
    `/api/v1/institutions/${user.institutionId}/course-enrollments/${enrollmentId}/grades/${gradeId}/cancel-deletion`,
    { method: "POST" },
  );
  const failure = await getResponseErrorActionState(response, [], "No se pudo deshacer la eliminación.");

  if (failure) {
    return { error: failure.error };
  }

  revalidatePath("/course-enrollments");
  revalidatePath("/my-teaching");
  revalidatePath("/my-course-enrollments");
  return {};
}

export async function publishInstitutionalGradesAction(classId: string): Promise<GradeActionResult> {
  if (!isValidUuid(classId)) {
    return { error: INVALID_ACTION_ARGUMENTS };
  }

  const user = await requireInstitutionalUser();
  const response = institutionalApiFetch(`/api/v1/institutions/${user.institutionId}/course-classes/${classId}/grades/publish`, {
    method: "POST",
  });
  const failure = await getResponseErrorActionState(response, [], "No se pudieron publicar las notas.");

  if (failure) {
    return { error: failure.error };
  }

  revalidatePath("/course-enrollments");
  revalidatePath("/my-teaching");
  revalidatePath("/my-course-enrollments");
  return {};
}

export async function createTeacherGradeAction(classId: string, enrollmentId: string, formData: FormData): Promise<GradeActionResult> {
  if (!isValidUuid(classId) || !isValidUuid(enrollmentId)) {
    return { error: INVALID_ACTION_ARGUMENTS };
  }

  const body = parseGradeForm(formData);

  if (!body) {
    return { error: "Revisá la evaluación y la nota (1 a 10, hasta 2 decimales)." };
  }

  const user = await requireInstitutionalUser();
  const response = institutionalApiFetch(
    `/api/v1/institutions/${user.institutionId}/teacher/classes/${classId}/enrollments/${enrollmentId}/grades`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    },
  );
  const failure = await getResponseErrorActionState(response, [], "No se pudo guardar la nota.");

  if (failure) {
    return { error: failure.error };
  }

  revalidatePath("/my-teaching");
  revalidatePath("/course-enrollments");
  revalidatePath("/my-course-enrollments");
  return { draft: true };
}

export async function updateTeacherGradeAction(
  classId: string,
  enrollmentId: string,
  gradeId: string,
  expectedVersion: number,
  formData: FormData,
): Promise<GradeActionResult> {
  if (
    !isValidUuid(classId) ||
    !isValidUuid(enrollmentId) ||
    !isValidUuid(gradeId) ||
    !Number.isInteger(expectedVersion) ||
    expectedVersion < 0
  ) {
    return { error: INVALID_ACTION_ARGUMENTS };
  }

  const body = parseGradeForm(formData);

  if (!body) {
    return { error: "Revisá la evaluación y la nota (1 a 10, hasta 2 decimales)." };
  }

  const user = await requireInstitutionalUser();
  const response = institutionalApiFetch(
    `/api/v1/institutions/${user.institutionId}/teacher/classes/${classId}/enrollments/${enrollmentId}/grades/${gradeId}`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...body, expectedVersion }),
    },
  );
  const failure = await getResponseErrorActionState(response, [], "No se pudo guardar la nota.");

  if (failure) {
    return { error: failure.error };
  }

  revalidatePath("/my-teaching");
  revalidatePath("/course-enrollments");
  revalidatePath("/my-course-enrollments");
  return { pending: true };
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
    (expectedVersion !== undefined && (!Number.isInteger(expectedVersion) || expectedVersion < 0))
  ) {
    return { error: INVALID_ACTION_ARGUMENTS };
  }

  const user = await requireInstitutionalUser();
  const params = expectedVersion !== undefined ? `?expectedVersion=${expectedVersion}` : "";
  const response = institutionalApiFetch(
    `/api/v1/institutions/${user.institutionId}/teacher/classes/${classId}/enrollments/${enrollmentId}/grades/${gradeId}${params}`,
    { method: "DELETE" },
  );
  const failure = await getResponseErrorActionState(response, [], "No se pudo eliminar la nota.");

  if (failure) {
    return { error: failure.error };
  }

  revalidatePath("/course-enrollments");
  revalidatePath("/my-teaching");
  revalidatePath("/my-course-enrollments");
  return {};
}

export async function cancelTeacherGradeDeletionAction(classId: string, enrollmentId: string, gradeId: string): Promise<GradeActionResult> {
  if (!isValidUuid(classId) || !isValidUuid(enrollmentId) || !isValidUuid(gradeId)) {
    return { error: INVALID_ACTION_ARGUMENTS };
  }

  const user = await requireInstitutionalUser();
  const response = institutionalApiFetch(
    `/api/v1/institutions/${user.institutionId}/teacher/classes/${classId}/enrollments/${enrollmentId}/grades/${gradeId}/cancel-deletion`,
    { method: "POST" },
  );
  const failure = await getResponseErrorActionState(response, [], "No se pudo deshacer la eliminación.");

  if (failure) {
    return { error: failure.error };
  }

  revalidatePath("/course-enrollments");
  revalidatePath("/my-teaching");
  revalidatePath("/my-course-enrollments");
  return {};
}

export async function publishTeacherGradesAction(classId: string): Promise<GradeActionResult> {
  if (!isValidUuid(classId)) {
    return { error: INVALID_ACTION_ARGUMENTS };
  }

  const user = await requireInstitutionalUser();
  const response = institutionalApiFetch(`/api/v1/institutions/${user.institutionId}/teacher/classes/${classId}/grades/publish`, {
    method: "POST",
  });
  const failure = await getResponseErrorActionState(response, [], "No se pudieron publicar las notas.");

  if (failure) {
    return { error: failure.error };
  }

  revalidatePath("/course-enrollments");
  revalidatePath("/my-teaching");
  revalidatePath("/my-course-enrollments");
  return {};
}
