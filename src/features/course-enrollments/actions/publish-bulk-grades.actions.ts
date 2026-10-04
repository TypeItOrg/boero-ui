"use server";

import { INVALID_ACTION_ARGUMENTS, isValidUuid } from "@common/utils/action-argument.util";
import { requireInstitutionalUser } from "@features/institutional-auth/services/get-institutional-user.service";
import { institutionalApiFetch } from "@features/institutional-auth/services/institutional-api-fetch.service";
import { revalidatePath } from "next/cache";

export type BulkPublishResult = {
  error?: string;
  publishedClasses?: number;
  publishedGrades?: number;
  deletedGrades?: number;
  affectedStudents?: number;
  failedClasses?: number;
};

export async function publishBulkInstitutionalGradesAction(classIds: string[]): Promise<BulkPublishResult> {
  if (!Array.isArray(classIds) || classIds.length === 0 || classIds.some((id) => !isValidUuid(id))) {
    return { error: INVALID_ACTION_ARGUMENTS };
  }

  const uniqueIds = [...new Set(classIds)];
  const user = await requireInstitutionalUser();
  let publishedClasses = 0;
  let publishedGrades = 0;
  let deletedGrades = 0;
  let affectedStudents = 0;
  let failedClasses = 0;

  for (const classId of uniqueIds) {
    const response = await institutionalApiFetch(
      `/api/v1/institutions/${user.institutionId}/course-classes/${classId}/grades/publish`,
      { method: "POST" },
    );

    if (!response.ok) {
      failedClasses += 1;
      continue;
    }

    try {
      const body = (await response.json()) as { publishedGrades: number; deletedGrades: number; affectedStudents: number };
      publishedClasses += 1;
      publishedGrades += body.publishedGrades ?? 0;
      deletedGrades += body.deletedGrades ?? 0;
      affectedStudents += body.affectedStudents ?? 0;
    } catch {
      failedClasses += 1;
    }
  }

  revalidatePath("/course-enrollments");
  revalidatePath("/my-course-enrollments");

  if (publishedClasses === 0) {
    return { error: "No se pudieron publicar las notas.", failedClasses };
  }

  return { publishedClasses, publishedGrades, deletedGrades, affectedStudents, failedClasses };
}
