"use server";

import { revalidatePath } from "next/cache";

import { INVALID_ACTION_ARGUMENTS, isValidUuid } from "@common/utils/action-argument.util";
import { getResponseErrorActionState } from "@common/utils/action-state.util";
import { platformApiFetch } from "@features/platform-auth/services/platform-api-fetch.service";
import { requirePlatformAccount } from "@features/platform-auth/services/get-platform-account.service";

type PlatformCourseEnrollmentActionResult = { error?: string };

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

export async function enrollPlatformApplicationCourseAction(
  institutionId: string,
  applicationId: string,
  applicationCourseId: string,
  expectedVersion: number,
  formData: FormData,
): Promise<PlatformCourseEnrollmentActionResult> {
  const assignmentBody = buildAssignmentBody(formData);

  if (
    !isValidUuid(institutionId) ||
    !isValidUuid(applicationId) ||
    !isValidUuid(applicationCourseId) ||
    !Number.isInteger(expectedVersion) ||
    expectedVersion < 0 ||
    !assignmentBody
  ) {
    return { error: INVALID_ACTION_ARGUMENTS };
  }

  await requirePlatformAccount();
  const response = platformApiFetch(
    `/api/v1/institutions/${institutionId}/enrollment-applications/${applicationId}/courses/${applicationCourseId}/enroll`,
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

  revalidatePath(`/admin/enrollment-applications/${institutionId}/${applicationId}`);
  return {};
}

export async function rejectPlatformApplicationCourseAction(
  institutionId: string,
  applicationId: string,
  applicationCourseId: string,
  expectedVersion: number,
  reason: string,
): Promise<PlatformCourseEnrollmentActionResult> {
  if (
    !isValidUuid(institutionId) ||
    !isValidUuid(applicationId) ||
    !isValidUuid(applicationCourseId) ||
    !Number.isInteger(expectedVersion) ||
    expectedVersion < 0 ||
    !reason.trim()
  ) {
    return { error: INVALID_ACTION_ARGUMENTS };
  }

  await requirePlatformAccount();
  const response = platformApiFetch(
    `/api/v1/institutions/${institutionId}/enrollment-applications/${applicationId}/courses/${applicationCourseId}/reject`,
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

  revalidatePath(`/admin/enrollment-applications/${institutionId}/${applicationId}`);
  return {};
}
