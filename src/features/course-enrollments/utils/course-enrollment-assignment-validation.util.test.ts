import { validateEnrollmentAssignment } from "@features/course-enrollments/utils/course-enrollment-assignment-validation.util";
import type { CourseEnrollmentAssignmentOptions } from "@features/course-enrollments/types/course-enrollment-assignment-options.types";

const CLASS_ID = "00000000-0000-4000-8000-000000000001";
const DAY_ID = "00000000-0000-4000-8000-000000000002";
const SCHEDULE_ID = "00000000-0000-4000-8000-000000000003";
const SLOT_ID = "00000000-0000-4000-8000-000000000004";

const OPTIONS: CourseEnrollmentAssignmentOptions = {
  courseId: "00000000-0000-4000-8000-000000000005",
  format: "INDIVIDUAL",
  classes: [
    {
      id: CLASS_ID,
      teacherIds: ["00000000-0000-4000-8000-000000000006"],
      teachers: [{ personId: "00000000-0000-4000-8000-000000000006", fullName: "Ana Garcia" }],
      days: [
        {
          id: DAY_ID,
          dayOfWeek: "MONDAY",
          capacity: 6,
          periodDurationMinutes: 60,
          schedules: [
            {
              id: SCHEDULE_ID,
              startTime: "10:00:00",
              endTime: "11:00:00",
              individualSlots: [{ id: SLOT_ID, startTime: "10:00:00", endTime: "11:00:00" }],
            },
          ],
        },
      ],
    },
  ],
};

function formData(assignments: unknown, courseClassId = CLASS_ID): FormData {
  const data = new FormData();
  data.set("courseClassId", courseClassId);
  data.set("assignments", typeof assignments === "string" ? assignments : JSON.stringify(assignments));
  return data;
}

describe("validateEnrollmentAssignment", () => {
  it("accepts a complete individual assignment", () => {
    const result = validateEnrollmentAssignment(formData([{ dayId: DAY_ID, classScheduleId: SCHEDULE_ID, individualSlotId: SLOT_ID }]), OPTIONS);

    expect(result).toEqual({ ok: true });
  });

  it("rejects an empty selection asking for at least one day", () => {
    const result = validateEnrollmentAssignment(formData([]), OPTIONS);

    expect(result.ok).toBe(false);
    expect(result.message).toMatch(/al menos un día/i);
  });

  it("marks the day missing its schedule with a specific message", () => {
    const result = validateEnrollmentAssignment(formData([{ dayId: DAY_ID, classScheduleId: "", individualSlotId: null }]), OPTIONS);

    expect(result.ok).toBe(false);
    expect(result.message).toMatch(/horario del lunes/i);
    expect(result.invalidDayIds).toEqual([DAY_ID]);
  });

  it("marks the day missing its individual period with a specific message", () => {
    const result = validateEnrollmentAssignment(formData([{ dayId: DAY_ID, classScheduleId: SCHEDULE_ID, individualSlotId: null }]), OPTIONS);

    expect(result.ok).toBe(false);
    expect(result.message).toMatch(/período del lunes/i);
    expect(result.invalidDayIds).toEqual([DAY_ID]);
  });

  it("accepts a grupal assignment without periods", () => {
    const grupal = { ...OPTIONS, format: "GRUPAL" as const };
    const result = validateEnrollmentAssignment(formData([{ dayId: DAY_ID, classScheduleId: SCHEDULE_ID, individualSlotId: null }]), grupal);

    expect(result).toEqual({ ok: true });
  });
});
