import { render, screen, waitFor } from "@testing-library/react";

import { BulkPublishGradesDialog } from "@features/course-enrollments/components/bulk-publish-grades-dialog";

const pendingClasses = [
  { courseId: "course-1", courseName: "Lenguaje", classId: "class-1", classLabel: "Clase 1", pendingChanges: 2, affectedStudents: 2 },
  { courseId: "course-1", courseName: "Lenguaje", classId: "class-2", classLabel: "Clase 2", pendingChanges: 3, affectedStudents: 1 },
  { courseId: "course-2", courseName: "Piano", classId: "class-3", classLabel: "Clase 1", pendingChanges: 1, affectedStudents: 1 },
];

describe("BulkPublishGradesDialog", () => {
  it("offers Todos options and enables class after course", async () => {
    global.fetch = jest.fn().mockResolvedValue({ ok: true, json: async () => pendingClasses } as Response);

    render(<BulkPublishGradesDialog open onOpenChange={() => undefined} onPublished={() => undefined} />);

    await waitFor(() => expect(screen.getByText("Todos los cursos")).toBeInTheDocument());
    expect(screen.getByText("Todas las clases")).toBeInTheDocument();
  });

  it("shows empty state without pending classes", async () => {
    global.fetch = jest.fn().mockResolvedValue({ ok: true, json: async () => [] } as Response);

    render(<BulkPublishGradesDialog open onOpenChange={() => undefined} onPublished={() => undefined} />);

    await waitFor(() => expect(screen.getByText("Sin cambios pendientes")).toBeInTheDocument());
    expect(await screen.findByRole("button", { name: "Publicar notas" })).toBeDisabled();
  });

  it("sums pending changes of the selection", async () => {
    global.fetch = jest.fn().mockResolvedValue({ ok: true, json: async () => pendingClasses } as Response);

    render(<BulkPublishGradesDialog open onOpenChange={() => undefined} onPublished={() => undefined} />);

    await waitFor(() => expect(screen.getByText("Todos los cursos")).toBeInTheDocument());
    expect(screen.getByText("6 cambios pendientes en la selección.")).toBeInTheDocument();
  });
});
