import * as React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { CourseEnrollmentAssignmentFields } from "@features/course-enrollments/components/course-enrollment-assignment-fields";
import type { CourseEnrollmentAssignmentOptions } from "@features/course-enrollments/types/course-enrollment-assignment-options.types";

const OPTIONS: CourseEnrollmentAssignmentOptions = {
  courseId: "00000000-0000-4000-8000-000000000005",
  format: "INDIVIDUAL",
  classes: [
    {
      id: "00000000-0000-4000-8000-000000000001",
      teacherIds: ["00000000-0000-4000-8000-000000000006", "00000000-0000-4000-8000-000000000007"],
      teachers: [
        { personId: "00000000-0000-4000-8000-000000000006", fullName: "Ana Garcia" },
        { personId: "00000000-0000-4000-8000-000000000007", fullName: "Luis Perez" },
      ],
      days: [
        {
          id: "00000000-0000-4000-8000-000000000002",
          dayOfWeek: "MONDAY",
          capacity: 6,
          periodDurationMinutes: 60,
          schedules: [
            {
              id: "00000000-0000-4000-8000-000000000003",
              startTime: "10:00:00",
              endTime: "11:00:00",
              individualSlots: [{ id: "00000000-0000-4000-8000-000000000004", startTime: "10:00:00", endTime: "11:00:00" }],
            },
          ],
        },
      ],
    },
    {
      id: "00000000-0000-4000-8000-000000000008",
      teacherIds: ["00000000-0000-4000-8000-000000000009"],
      teachers: [{ personId: "00000000-0000-4000-8000-000000000009", fullName: "Maria Lopez" }],
      days: [],
    },
  ],
};

describe("CourseEnrollmentAssignmentFields", () => {
  it("shows the teachers of the selected class and updates them when the class changes", () => {
    render(<CourseEnrollmentAssignmentFields options={OPTIONS} />);

    expect(screen.getByText(/Dictan esta clase: Ana Garcia, Luis Perez/)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("combobox", { name: /clase/i }));
    fireEvent.click(screen.getByRole("option", { name: /Clase 2/ }));

    expect(screen.getByText(/Dictan esta clase: Maria Lopez/)).toBeInTheDocument();
  });

  it("reveals schedule and period selects only for checked days", () => {
    render(<CourseEnrollmentAssignmentFields options={OPTIONS} />);

    expect(screen.queryByRole("combobox", { name: /horario/i })).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("checkbox", { name: /lunes/i }));

    expect(screen.getByRole("combobox", { name: /horario/i })).toBeInTheDocument();
  });

  it("marks incomplete days with an error style", () => {
    const dayId = "00000000-0000-4000-8000-000000000002";
    render(<CourseEnrollmentAssignmentFields options={OPTIONS} invalidDayIds={[dayId]} />);

    fireEvent.click(screen.getByRole("checkbox", { name: /lunes/i }));

    expect(screen.getByRole("combobox", { name: /horario/i })).toHaveAttribute("aria-invalid", "true");
  });
});
