import { isValidUuid } from "@common/utils/action-argument.util";

export function parseAssignments(value: FormDataEntryValue | null): { classScheduleId: string; individualSlotId: string | null }[] | null {
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

export function buildAssignmentBody(formData: FormData): {
  courseClassId: string;
  assignments: { classScheduleId: string; individualSlotId: string | null }[];
} | null {
  const courseClassId = formData.get("courseClassId");
  const assignments = parseAssignments(formData.get("assignments"));

  if (typeof courseClassId !== "string" || !isValidUuid(courseClassId) || !assignments || assignments.length === 0) {
    return null;
  }

  return { courseClassId, assignments };
}
