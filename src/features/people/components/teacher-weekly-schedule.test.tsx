import { render, screen } from "@testing-library/react";

import { TeacherWeeklySchedule } from "@features/people/components/teacher-weekly-schedule";

describe("TeacherWeeklySchedule", () => {
  it("renders all seven days in order without collapsing weekend columns", () => {
    render(
      <TeacherWeeklySchedule
        courses={[
          {
            courseId: "course-1",
            academicSpaceName: "Piano",
            instrumentName: "Piano",
            academicYear: 2026,
            classes: [
              {
                id: "class-1",
                classNumber: 1,
                teachers: [],
                days: [
                  {
                    dayOfWeek: "SATURDAY",
                    capacity: null,
                    periodDurationMinutes: null,
                    schedules: [{ startTime: "10:00:00", endTime: "11:00:00" }],
                  },
                  {
                    dayOfWeek: "SUNDAY",
                    capacity: null,
                    periodDurationMinutes: null,
                    schedules: [{ startTime: "12:00:00", endTime: "13:00:00" }],
                  },
                ],
              },
            ],
          },
        ]}
      />,
    );

    expect(screen.getByText("Sábado")).toBeInTheDocument();
    expect(screen.getByText("Domingo")).toBeInTheDocument();
    expect(screen.getByText("10:00 - 11:00")).toBeInTheDocument();
    expect(screen.getByText("12:00 - 13:00")).toBeInTheDocument();
  });
});
