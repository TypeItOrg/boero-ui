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
      label: "Clase 1",
      teacherIds: ["00000000-0000-4000-8000-000000000006"],
      teachers: [{ personId: "00000000-0000-4000-8000-000000000006", fullName: "Ana Garcia" }],
      days: [
        {
          id: DAY_ID,
          dayOfWeek: "MONDAY",
          capacity: 6,
          availableCapacity: 6,
          periodDurationMinutes: 60,
          schedules: [
            {
              id: SCHEDULE_ID,
              startTime: "10:00:00",
              endTime: "11:00:00",
              individualSlots: [{ id: SLOT_ID, startTime: "10:00:00", endTime: "11:00:00", available: true }],
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
  it("rejects malformed items and a class outside the available options", () => {
    expect(validateEnrollmentAssignment(formData([null]), OPTIONS).ok).toBe(false);
    expect(validateEnrollmentAssignment(formData([{ classScheduleId: SCHEDULE_ID, individualSlotId: SLOT_ID }], DAY_ID), OPTIONS).ok).toBe(false);
  });

  it("rejects a period outside its schedule or a group assignment with an individual period", () => {
    expect(validateEnrollmentAssignment(formData([{ dayId: DAY_ID, classScheduleId: SCHEDULE_ID, individualSlotId: CLASS_ID }]), OPTIONS).ok).toBe(
      false,
    );
    expect(
      validateEnrollmentAssignment(formData([{ dayId: DAY_ID, classScheduleId: SCHEDULE_ID, individualSlotId: SLOT_ID }]), {
        ...OPTIONS,
        format: "GRUPAL",
      }).ok,
    ).toBe(false);
  });

  it("rejects duplicate days and occupied periods", () => {
    const assignment = { dayId: DAY_ID, classScheduleId: SCHEDULE_ID, individualSlotId: SLOT_ID };
    expect(validateEnrollmentAssignment(formData([assignment, assignment]), OPTIONS).ok).toBe(false);
    const occupied = JSON.parse(JSON.stringify(OPTIONS)) as CourseEnrollmentAssignmentOptions;
    occupied.classes[0].days[0].schedules[0].individualSlots[0].available = false;
    expect(validateEnrollmentAssignment(formData([assignment]), occupied).ok).toBe(false);
  });
});
