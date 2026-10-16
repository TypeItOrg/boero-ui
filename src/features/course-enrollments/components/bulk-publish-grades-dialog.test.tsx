import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { publishBulkInstitutionalGradesAction } from "@features/course-enrollments/actions/publish-bulk-grades.actions";
import { BulkPublishGradesDialog } from "@features/course-enrollments/components/bulk-publish-grades-dialog";

jest.mock("@features/course-enrollments/actions/publish-bulk-grades.actions", () => ({
  publishBulkInstitutionalGradesAction: jest.fn(),
}));

const pendingClasses = [
  { courseId: "course-1", courseName: "Lenguaje", classId: "class-1", classLabel: "Clase 1", pendingChanges: 2, affectedStudents: 2 },
  { courseId: "course-1", courseName: "Lenguaje", classId: "class-2", classLabel: "Clase 2", pendingChanges: 3, affectedStudents: 1 },
  { courseId: "course-2", courseName: "Piano", classId: "class-3", classLabel: "Clase 1", pendingChanges: 1, affectedStudents: 1 },
];

function jsonResponse(data: unknown): Response {
  return { ok: true, json: async () => data } as Response;
}

function renderDialog(open = true) {
  return render(<BulkPublishGradesDialog open={open} onOpenChange={() => undefined} onPublished={() => undefined} />);
}

describe("BulkPublishGradesDialog", () => {
  it("offers Todos options and enables class selection after choosing a course", async () => {
    const user = userEvent.setup();

    global.fetch = jest.fn().mockResolvedValue(jsonResponse(pendingClasses));

    renderDialog();

    const courseCombobox = await screen.findByRole("combobox", { name: "Curso" });

    expect(courseCombobox).toHaveTextContent("Todos los cursos");
    expect(screen.getByRole("combobox", { name: "Clase" })).toHaveTextContent("Todas las clases");

    await user.click(courseCombobox);
    await user.click(await screen.findByRole("option", { name: "Lenguaje" }));

    const classCombobox = screen.getByRole("combobox", { name: "Clase" });

    expect(classCombobox).toBeEnabled();

    await user.click(classCombobox);
    await user.click(await screen.findByRole("option", { name: "Clase 2 · 3 pendientes" }));

    expect(screen.getByText("3 cambios pendientes en la selección.")).toBeInTheDocument();
  });

  it("shows empty state without pending classes", async () => {
    global.fetch = jest.fn().mockResolvedValue(jsonResponse([]));

    renderDialog();

    await waitFor(() => expect(screen.getByText("Sin cambios pendientes")).toBeInTheDocument());
    expect(await screen.findByRole("button", { name: "Publicar notas" })).toBeDisabled();
  });

  it("sums pending changes of the selection", async () => {
    global.fetch = jest.fn().mockResolvedValue(jsonResponse(pendingClasses));

    renderDialog();

    expect(await screen.findByText("6 cambios pendientes en la selección.")).toBeInTheDocument();
  });

  it("reloads pending classes on every open and ignores the previous open's late response", async () => {
    const updatedClasses = [
      { courseId: "course-2", courseName: "Piano", classId: "class-9", classLabel: "Clase 9", pendingChanges: 5, affectedStudents: 1 },
    ];

    let resolveFirst: ((response: Response) => void) | undefined;
    let resolveSecond: ((response: Response) => void) | undefined;

    global.fetch = jest
      .fn()
      .mockImplementationOnce(
        () =>
          new Promise<Response>((resolve) => {
            resolveFirst = resolve;
          }),
      )
      .mockImplementationOnce(
        () =>
          new Promise<Response>((resolve) => {
            resolveSecond = resolve;
          }),
      );

    const { rerender } = renderDialog();

    expect(screen.getByText(/Cargando clases con cambios/)).toBeInTheDocument();

    rerender(<BulkPublishGradesDialog open={false} onOpenChange={() => undefined} onPublished={() => undefined} />);

    rerender(<BulkPublishGradesDialog open onOpenChange={() => undefined} onPublished={() => undefined} />);

    expect(screen.getByText(/Cargando clases con cambios/)).toBeInTheDocument();
    expect(screen.queryByText("Todos los cursos")).not.toBeInTheDocument();

    resolveSecond?.(jsonResponse(updatedClasses));

    await waitFor(() => expect(screen.getByText("5 cambios pendientes en la selección.")).toBeInTheDocument());

    resolveFirst?.(jsonResponse(pendingClasses));

    await waitFor(() => expect(screen.getByText("5 cambios pendientes en la selección.")).toBeInTheDocument());
    expect(screen.queryByText("6 cambios pendientes en la selección.")).not.toBeInTheDocument();
    expect(global.fetch).toHaveBeenCalledTimes(2);
  });

  it("shows a real load error with retry instead of an empty state", async () => {
    const user = userEvent.setup();

    global.fetch = jest.fn().mockRejectedValueOnce(new Error("network")).mockResolvedValueOnce(jsonResponse(pendingClasses));

    renderDialog();

    await waitFor(() => expect(screen.getByText("No se pudieron cargar las clases con cambios. Reintentá.")).toBeInTheDocument());
    expect(screen.queryByText("Sin cambios pendientes")).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Reintentar" }));

    expect(await screen.findByRole("combobox", { name: "Curso" })).toBeInTheDocument();
    expect(global.fetch).toHaveBeenCalledTimes(2);
  });

  it("keeps an uncertain report visible when the automatic refresh finds no pending classes", async () => {
    const user = userEvent.setup();
    const publishAction = jest.mocked(publishBulkInstitutionalGradesAction);

    publishAction.mockReset().mockResolvedValueOnce({
      error: "No se pudo confirmar la publicación. Verificá el estado antes de reintentar.",
      uncertainClasses: 3,
      uncertainClassIds: ["class-1", "class-2", "class-3"],
      results: [
        { classId: "class-1", status: "uncertain", error: "Sin respuesta del servidor." },
        { classId: "class-2", status: "uncertain", error: "Sin respuesta del servidor." },
        { classId: "class-3", status: "uncertain", error: "Sin respuesta del servidor." },
      ],
    });

    global.fetch = jest.fn().mockResolvedValueOnce(jsonResponse(pendingClasses)).mockResolvedValueOnce(jsonResponse([]));

    renderDialog();

    await screen.findByRole("combobox", { name: "Curso" });

    await user.click(screen.getByRole("button", { name: "Publicar notas" }));

    expect(await screen.findByText("Se publicaron 0 de 3 clases.")).toBeInTheDocument();

    await waitFor(() => expect(global.fetch).toHaveBeenCalledTimes(2));

    expect(screen.getByText("Se publicaron 0 de 3 clases.")).toBeInTheDocument();
    expect(screen.getAllByText(/Sin confirmar — /)).toHaveLength(3);
    expect(screen.queryByText("Sin cambios pendientes")).not.toBeInTheDocument();
  });
});
