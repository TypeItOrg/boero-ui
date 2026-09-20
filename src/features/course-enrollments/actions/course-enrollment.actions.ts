"use server";

import { isValidUuid, INVALID_ACTION_ARGUMENTS } from "@common/utils/action-argument.util";
import { getResponseErrorActionState } from "@common/utils/action-state.util";
import { requireInstitutionalUser } from "@features/institutional-auth/services/get-institutional-user.service";
import { institutionalApiFetch } from "@features/institutional-auth/services/institutional-api-fetch.service";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSafeReturnTo } from "@common/utils/return-to.util";
import { ACADEMIC_ENROLLMENT_STATUS } from "@features/course-enrollments/types/academic-enrollment-status.types";

const allowedAcademicStatuses = new Set<string>(Object.values(ACADEMIC_ENROLLMENT_STATUS));

type CourseEnrollmentActionResult = { error?: string };

function parseAssignments(value: FormDataEntryValue | null): { classScheduleId: string; individualSlotId: string | null }[] | null {
  if (typeof value !== "string") {
    return null;
  }

  try {
    const parsed: unknown = JSON.parse(value);

    if (!Array.isArray(parsed)) {
      return null;
    }

    if (
      parsed.some((assignment) => {
        if (typeof assignment !== "object" || assignment === null) {
          return true;
        }

        const classScheduleId = (assignment as { classScheduleId?: unknown }).classScheduleId;
        const individualSlotId = (assignment as { individualSlotId?: unknown }).individualSlotId;

        return (
          typeof classScheduleId !== "string" ||
          !isValidUuid(classScheduleId) ||
          !(individualSlotId === null || (typeof individualSlotId === "string" && isValidUuid(individualSlotId)))
        );
      })
    ) {
      return null;
    }

    return parsed as { classScheduleId: string; individualSlotId: string | null }[];
  } catch {
    return null;
  }
}

function buildAssignmentBody(
  formData: FormData,
): { courseClassId: string; assignments: { classScheduleId: string; individualSlotId: string | null }[] } | null {
  const courseClassId = formData.get("courseClassId");
  const assignments = parseAssignments(formData.get("assignments"));

  if (typeof courseClassId !== "string" || !isValidUuid(courseClassId) || !assignments || assignments.length === 0) {
    return null;
  }

  return { courseClassId, assignments };
}

export async function createManualCourseEnrollmentAction(formData: FormData): Promise<CourseEnrollmentActionResult> {
  const rawReturnTo = formData.get("returnTo");
  if (rawReturnTo !== null && typeof rawReturnTo !== "string") {
    return { error: INVALID_ACTION_ARGUMENTS };
  }
  const returnTo = getSafeReturnTo(rawReturnTo ?? undefined, "/course-enrollments");
  const studentId = formData.get("studentId");
  const courseId = formData.get("courseId");
  const assignmentBody = buildAssignmentBody(formData);

  if (typeof studentId !== "string" || typeof courseId !== "string" || !isValidUuid(studentId) || !isValidUuid(courseId) || !assignmentBody) {
    return { error: INVALID_ACTION_ARGUMENTS };
  }

  const user = await requireInstitutionalUser();
  const response = institutionalApiFetch(`/api/v1/institutions/${user.institutionId}/course-enrollments`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ studentId, courseId, ...assignmentBody }),
  });
  const failure = await getResponseErrorActionState(response, [], "No se pudo registrar la inscripción manual.");

  if (failure) {
    return { error: failure.error };
  }

  revalidatePath("/course-enrollments");
  redirect(returnTo);
}

export async function enrollApplicationCourseAction(
  applicationId: string,
  applicationCourseId: string,
  expectedVersion: number,
  formData: FormData,
): Promise<CourseEnrollmentActionResult> {
  const assignmentBody = buildAssignmentBody(formData);

  if (
    !isValidUuid(applicationId) ||
    !isValidUuid(applicationCourseId) ||
    !Number.isInteger(expectedVersion) ||
    expectedVersion < 0 ||
    !assignmentBody
  ) {
    return { error: INVALID_ACTION_ARGUMENTS };
  }

  const user = await requireInstitutionalUser();
  const response = institutionalApiFetch(
    `/api/v1/institutions/${user.institutionId}/enrollment-applications/${applicationId}/courses/${applicationCourseId}/enroll`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...assignmentBody, expectedVersion }),
    },
  );
  const failure = await getResponseErrorActionState(response, [], "No se pudo inscribir la solicitud de cursada.");

  if (failure) {
    return { error: failure.error };
  }

  revalidatePath(`/enrollment-applications/${applicationId}`);
  revalidatePath("/course-enrollments");
  return {};
}

export async function rejectApplicationCourseAction(
  applicationId: string,
  applicationCourseId: string,
  expectedVersion: number,
  reason: string,
): Promise<CourseEnrollmentActionResult> {
  if (
    !isValidUuid(applicationId) ||
    !isValidUuid(applicationCourseId) ||
    !Number.isInteger(expectedVersion) ||
    expectedVersion < 0 ||
    typeof reason !== "string" ||
    !reason.trim()
  ) {
    return { error: INVALID_ACTION_ARGUMENTS };
  }

  const user = await requireInstitutionalUser();
  const response = institutionalApiFetch(
    `/api/v1/institutions/${user.institutionId}/enrollment-applications/${applicationId}/courses/${applicationCourseId}/reject`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reason, expectedVersion }),
    },
  );
  const failure = await getResponseErrorActionState(response, [], "No se pudo rechazar la solicitud de cursada.");

  if (failure) {
    return { error: failure.error };
  }

  revalidatePath(`/enrollment-applications/${applicationId}`);
  return {};
}

export async function withdrawCourseEnrollmentAction(
  enrollmentId: string,
  type: "VOLUNTARY" | "ADMINISTRATIVE",
  reason: string,
  expectedVersion?: number,
): Promise<CourseEnrollmentActionResult> {
  if (
    !isValidUuid(enrollmentId) ||
    (type !== "VOLUNTARY" && type !== "ADMINISTRATIVE") ||
    typeof reason !== "string" ||
    !reason.trim() ||
    (expectedVersion !== undefined && (!Number.isInteger(expectedVersion) || expectedVersion < 0))
  ) {
    return { error: INVALID_ACTION_ARGUMENTS };
  }

  const user = await requireInstitutionalUser();
  const response = institutionalApiFetch(`/api/v1/institutions/${user.institutionId}/course-enrollments/${enrollmentId}/withdraw`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ type, reason, expectedVersion }),
  });
  const failure = await getResponseErrorActionState(response, [], "No se pudo registrar la baja.");

  if (failure) {
    return { error: failure.error };
  }

  revalidatePath("/course-enrollments");
  revalidatePath("/my-course-enrollments");
  return {};
}

export async function updateCourseAcademicStatusAction(
  enrollmentId: string,
  status: string,
  reason: string,
  expectedVersion?: number,
): Promise<CourseEnrollmentActionResult> {
  if (
    !isValidUuid(enrollmentId) ||
    typeof reason !== "string" ||
    !reason.trim() ||
    !allowedAcademicStatuses.has(status) ||
    (expectedVersion !== undefined && (!Number.isInteger(expectedVersion) || expectedVersion < 0))
  ) {
    return { error: INVALID_ACTION_ARGUMENTS };
  }

  const user = await requireInstitutionalUser();
  const response = institutionalApiFetch(`/api/v1/institutions/${user.institutionId}/course-enrollments/${enrollmentId}/academic-status`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status, reason, expectedVersion }),
  });
  const failure = await getResponseErrorActionState(response, [], "No se pudo actualizar el resultado.");

  if (failure) {
    return { error: failure.error };
  }

  revalidatePath("/course-enrollments");
  revalidatePath("/my-course-enrollments");
  return {};
}
