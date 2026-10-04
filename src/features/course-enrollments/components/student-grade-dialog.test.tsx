import { render, screen, waitFor } from "@testing-library/react";

import { StudentGradeDialog } from "@features/course-enrollments/components/student-grade-dialog";
import type { CourseEnrollment } from "@features/course-enrollments/types/course-enrollment.types";

const enrollment = {
  id: "enrollment-1",
  academicSpaceName: "Lenguaje",
  courseClassLabel: "Clase 1",
} as CourseEnrollment;

describe("StudentGradeDialog", () => {
  it("shows only published evaluation and value", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => [{ id: "grade-1", evaluation: "Parcial 1", value: 8 }],
    } as Response);

    render(<StudentGradeDialog enrollment={enrollment} open onOpenChange={() => undefined} />);

    await waitFor(() => expect(screen.getByText("Parcial 1")).toBeInTheDocument());
    expect(screen.queryByText(/Cargada por/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Borrador/i)).not.toBeInTheDocument();
  });

  it("shows empty state without mentioning drafts", async () => {
    global.fetch = jest.fn().mockResolvedValue({ ok: true, json: async () => [] } as Response);

    render(<StudentGradeDialog enrollment={enrollment} open onOpenChange={() => undefined} />);

    await waitFor(() => expect(screen.getByText(/Todavía no hay notas publicadas/)).toBeInTheDocument());
    expect(screen.queryByText(/borrador/i)).not.toBeInTheDocument();
  });
});
