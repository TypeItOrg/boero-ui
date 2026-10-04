import { render, screen } from "@testing-library/react";

import { PublishGradesDialog } from "@features/course-enrollments/components/publish-grades-dialog";

describe("PublishGradesDialog", () => {
  it("explains class scope and pending counts", () => {
    render(
      <PublishGradesDialog
        classId="class-1"
        mode="teacher"
        summary={{ pendingChanges: 12, affectedStudents: 8, newGrades: 5, modifiedGrades: 4, deletedGrades: 3 }}
        open
        onOpenChange={() => undefined}
        onPublished={() => undefined}
      />,
    );

    expect(screen.getByText("Publicar notas")).toBeInTheDocument();
    expect(screen.getByText(/12 cambios pendientes para 8 estudiantes/)).toBeInTheDocument();
    expect(screen.getByText(/afecta a toda la clase/)).toBeInTheDocument();
  });

  it("disables publish without changes", () => {
    render(
      <PublishGradesDialog
        classId="class-1"
        mode="institutional"
        summary={{ pendingChanges: 0, affectedStudents: 0, newGrades: 0, modifiedGrades: 0, deletedGrades: 0 }}
        open
        onOpenChange={() => undefined}
        onPublished={() => undefined}
        label="Publicar notas de la clase"
      />,
    );

    expect(screen.getByRole("button", { name: /Publicar notas de la clase/ })).toBeDisabled();
  });
});
