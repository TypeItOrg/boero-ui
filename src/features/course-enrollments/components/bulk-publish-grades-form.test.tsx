import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { publishBulkInstitutionalGradesAction, type BulkPublishResult } from "@features/course-enrollments/actions/publish-bulk-grades.actions";
import { BulkPublishGradesForm } from "@features/course-enrollments/components/bulk-publish-grades-form";
import type { PendingClassGrades } from "@features/course-enrollments/types/pending-class-grades.types";
import { GRADES_CHANGED_EVENT } from "@features/course-enrollments/utils/course-enrollment-grade-events.util";

jest.mock("@features/course-enrollments/actions/publish-bulk-grades.actions", () => ({
  publishBulkInstitutionalGradesAction: jest.fn(),
}));

const pendingClasses: PendingClassGrades[] = [
  { courseId: "course-1", courseName: "Lenguaje", classId: "class-1", classLabel: "Clase 1", pendingChanges: 2, affectedStudents: 2 },
  { courseId: "course-1", courseName: "Lenguaje", classId: "class-2", classLabel: "Clase 2", pendingChanges: 3, affectedStudents: 1 },
  { courseId: "course-2", courseName: "Piano", classId: "class-3", classLabel: "Clase 1", pendingChanges: 1, affectedStudents: 1 },
];

type FormProps = Parameters<typeof BulkPublishGradesForm>[0];

function renderForm(overrides: Partial<FormProps> = {}): FormProps {
  const props: FormProps = {
    classes: pendingClasses,
    isRefreshing: false,
    refreshError: null,
    onRefreshPendingClasses: jest.fn(),
    onOpenChange: jest.fn(),
    onPublished: jest.fn(),
    onPendingChange: jest.fn(),
    onReportAvailable: jest.fn(),
    ...overrides,
  };

  render(<BulkPublishGradesForm {...props} />);

  return props;
}

it("publishes the whole selection in a single batch and closes on full success", async () => {
  const user = userEvent.setup();
  const publishAction = jest.mocked(publishBulkInstitutionalGradesAction);

  publishAction.mockReset().mockResolvedValueOnce({
    publishedClasses: 3,
    publishedGrades: 6,
    deletedGrades: 0,
    affectedStudents: 4,
    results: [
      { classId: "class-1", status: "published", publishedGrades: 2, deletedGrades: 0, affectedStudents: 2 },
      { classId: "class-2", status: "published", publishedGrades: 3, deletedGrades: 0, affectedStudents: 1 },
      { classId: "class-3", status: "published", publishedGrades: 1, deletedGrades: 0, affectedStudents: 1 },
    ],
  });

  const gradesChanged = jest.fn();
  window.addEventListener(GRADES_CHANGED_EVENT, gradesChanged);

  const props = renderForm();

  await user.click(screen.getByRole("button", { name: "Publicar notas" }));

  await waitFor(() => expect(props.onOpenChange).toHaveBeenCalledWith(false));

  expect(publishAction).toHaveBeenCalledTimes(1);
  expect([...publishAction.mock.calls[0][0]].sort()).toEqual(["class-1", "class-2", "class-3"]);
  expect(props.onPublished).toHaveBeenCalledTimes(1);
  expect(props.onRefreshPendingClasses).not.toHaveBeenCalled();
  expect(gradesChanged).toHaveBeenCalledTimes(1);
  expect(props.onPendingChange).toHaveBeenCalledWith(true);
  expect(props.onPendingChange).toHaveBeenLastCalledWith(false);

  window.removeEventListener(GRADES_CHANGED_EVENT, gradesChanged);
});

it("splits selections larger than the batch limit and reports batch progress", async () => {
  const user = userEvent.setup();
  const publishAction = jest.mocked(publishBulkInstitutionalGradesAction);

  const manyClasses: PendingClassGrades[] = Array.from({ length: 25 }, (_, index) => ({
    courseId: "course-1",
    courseName: "Lenguaje",
    classId: `class-${index + 1}`,
    classLabel: `Clase ${String(index + 1).padStart(2, "0")}`,
    pendingChanges: 1,
    affectedStudents: 1,
  }));

  let finishFirstBatch: ((value: BulkPublishResult) => void) | undefined;

  publishAction
    .mockReset()
    .mockImplementationOnce(
      () =>
        new Promise<BulkPublishResult>((resolve) => {
          finishFirstBatch = resolve;
        }),
    )
    .mockImplementation(async (batch: string[]) => ({
      publishedClasses: batch.length,
      publishedGrades: batch.length,
      deletedGrades: 0,
      affectedStudents: batch.length,
      results: batch.map((classId) => ({ classId, status: "published" as const, publishedGrades: 1, deletedGrades: 0, affectedStudents: 1 })),
    }));

  const props = renderForm({ classes: manyClasses });

  await user.click(screen.getByRole("button", { name: "Publicar notas" }));

  await waitFor(() => expect(screen.getByRole("button", { name: "Publicando… (lote 1 de 2)" })).toBeDisabled());
  expect(publishAction).toHaveBeenCalledTimes(1);

  const firstBatch = publishAction.mock.calls[0][0];

  expect(firstBatch).toHaveLength(20);
  expect(firstBatch).toEqual(manyClasses.slice(0, 20).map((entry) => entry.classId));

  if (!finishFirstBatch) {
    throw new Error("The first batch was not submitted");
  }

  finishFirstBatch({
    publishedClasses: firstBatch.length,
    publishedGrades: firstBatch.length,
    deletedGrades: 0,
    affectedStudents: firstBatch.length,
    results: firstBatch.map((classId) => ({ classId, status: "published", publishedGrades: 1, deletedGrades: 0, affectedStudents: 1 })),
  });

  await waitFor(() => expect(props.onOpenChange).toHaveBeenCalledWith(false));

  expect(publishAction).toHaveBeenCalledTimes(2);
  expect(publishAction.mock.calls[1][0]).toEqual(manyClasses.slice(20).map((entry) => entry.classId));
});

it("keeps a per-class report, updates the system and refreshes pending classes on partial outcomes", async () => {
  const user = userEvent.setup();
  const publishAction = jest.mocked(publishBulkInstitutionalGradesAction);

  publishAction.mockReset().mockResolvedValueOnce({
    publishedClasses: 1,
    publishedGrades: 2,
    deletedGrades: 0,
    affectedStudents: 2,
    failedClasses: 1,
    uncertainClasses: 1,
    uncertainClassIds: ["class-3"],
    results: [
      { classId: "class-1", status: "published", publishedGrades: 2, deletedGrades: 0, affectedStudents: 2 },
      { classId: "class-2", status: "failed", error: "La clase no se pudo publicar (HTTP 500)." },
      {
        classId: "class-3",
        status: "uncertain",
        error: "No se pudo confirmar la publicación. Verificá el estado antes de reintentar.",
      },
    ],
  });

  const gradesChanged = jest.fn();
  window.addEventListener(GRADES_CHANGED_EVENT, gradesChanged);

  const props = renderForm();

  await user.click(screen.getByRole("button", { name: "Publicar notas" }));

  expect(await screen.findByText("Se publicaron 1 de 3 clases.")).toBeInTheDocument();
  expect(screen.getByText(/Cada clase se publica de forma independiente/)).toBeInTheDocument();
  expect(screen.getByText(/Lenguaje · Clase 1/)).toBeInTheDocument();
  expect(screen.getByText(/Lenguaje · Clase 2/)).toBeInTheDocument();
  expect(screen.getByText(/Piano · Clase 1/)).toBeInTheDocument();
  expect(screen.getByText(/Publicada — 2 notas publicadas/)).toBeInTheDocument();
  expect(screen.getByText(/Falló — La clase no se pudo publicar \(HTTP 500\)\./)).toBeInTheDocument();
  expect(screen.getByText(/Sin confirmar — No se pudo confirmar/)).toBeInTheDocument();

  expect(props.onOpenChange).not.toHaveBeenCalled();
  expect(props.onPublished).toHaveBeenCalledTimes(1);
  expect(props.onRefreshPendingClasses).toHaveBeenCalledTimes(1);
  expect(gradesChanged).toHaveBeenCalledTimes(1);
  expect(publishAction).toHaveBeenCalledTimes(1);

  window.removeEventListener(GRADES_CHANGED_EVENT, gradesChanged);
});

it("counts only classes with a confirmed response", async () => {
  const user = userEvent.setup();
  const publishAction = jest.mocked(publishBulkInstitutionalGradesAction);

  publishAction.mockReset().mockResolvedValueOnce({
    publishedClasses: 3,
    publishedGrades: 99,
    results: [
      { classId: "class-1", status: "published", publishedGrades: 2, deletedGrades: 0, affectedStudents: 2 },
      { classId: "class-2", status: "uncertain", error: "Sin respuesta del servidor." },
      { classId: "class-3", status: "uncertain", error: "Sin respuesta del servidor." },
    ],
  });

  const props = renderForm();

  await user.click(screen.getByRole("button", { name: "Publicar notas" }));

  expect(await screen.findByText("Se publicaron 1 de 3 clases.")).toBeInTheDocument();
  expect(props.onRefreshPendingClasses).toHaveBeenCalledTimes(1);
  expect(props.onOpenChange).not.toHaveBeenCalled();
});

it("does not retry uncertain classes automatically and allows a deliberate second attempt", async () => {
  const user = userEvent.setup();
  const publishAction = jest.mocked(publishBulkInstitutionalGradesAction);

  publishAction
    .mockReset()
    .mockResolvedValueOnce({
      error: "No se pudo confirmar la publicación. Verificá el estado antes de reintentar.",
      uncertainClasses: 3,
      uncertainClassIds: ["class-1", "class-2", "class-3"],
      results: [
        { classId: "class-1", status: "uncertain", error: "Sin respuesta del servidor." },
        { classId: "class-2", status: "uncertain", error: "Sin respuesta del servidor." },
        { classId: "class-3", status: "uncertain", error: "Sin respuesta del servidor." },
      ],
    })
    .mockResolvedValueOnce({
      publishedClasses: 3,
      publishedGrades: 3,
      deletedGrades: 0,
      affectedStudents: 3,
      results: [
        { classId: "class-1", status: "published", publishedGrades: 1, deletedGrades: 0, affectedStudents: 1 },
        { classId: "class-2", status: "published", publishedGrades: 1, deletedGrades: 0, affectedStudents: 1 },
        { classId: "class-3", status: "published", publishedGrades: 1, deletedGrades: 0, affectedStudents: 1 },
      ],
    });

  const props = renderForm();

  await user.click(screen.getByRole("button", { name: "Publicar notas" }));

  expect(await screen.findByText("No se pudo confirmar la publicación. Verificá el estado antes de reintentar.")).toBeInTheDocument();
  expect(publishAction).toHaveBeenCalledTimes(1);
  expect(props.onOpenChange).not.toHaveBeenCalled();
  expect(props.onRefreshPendingClasses).toHaveBeenCalledTimes(1);
  expect(screen.getAllByText(/Sin confirmar — /)).toHaveLength(3);

  await user.click(screen.getByRole("button", { name: "Publicar notas" }));

  await waitFor(() => expect(props.onOpenChange).toHaveBeenCalledWith(false));
  expect(publishAction).toHaveBeenCalledTimes(2);
});

it("marks the whole batch as uncertain when the action call itself fails", async () => {
  const user = userEvent.setup();
  const publishAction = jest.mocked(publishBulkInstitutionalGradesAction);

  publishAction.mockReset().mockRejectedValueOnce(new Error("network"));

  const props = renderForm();

  await user.click(screen.getByRole("button", { name: "Publicar notas" }));

  expect(await screen.findByText("No se pudo confirmar la publicación. Verificá el estado antes de reintentar.")).toBeInTheDocument();
  expect(screen.getAllByText(/Sin confirmar — /)).toHaveLength(3);
  expect(props.onRefreshPendingClasses).toHaveBeenCalledTimes(1);
  expect(props.onPublished).not.toHaveBeenCalled();
});

it("resets the selection when the refreshed pending list no longer contains it", async () => {
  const user = userEvent.setup();
  const baseProps = {
    isRefreshing: false,
    refreshError: null,
    onRefreshPendingClasses: jest.fn(),
    onOpenChange: jest.fn(),
    onPublished: jest.fn(),
    onPendingChange: jest.fn(),
    onReportAvailable: jest.fn(),
  };

  const { rerender } = render(<BulkPublishGradesForm {...baseProps} classes={pendingClasses} />);

  await user.click(screen.getByRole("combobox", { name: "Curso" }));
  await user.click(await screen.findByRole("option", { name: "Piano" }));
  await user.click(screen.getByRole("combobox", { name: "Clase" }));
  await user.click(await screen.findByRole("option", { name: "Clase 1 · 1 pendientes" }));

  expect(screen.getByText("1 cambios pendientes en la selección.")).toBeInTheDocument();

  rerender(<BulkPublishGradesForm {...baseProps} classes={pendingClasses.slice(0, 2)} />);

  await waitFor(() => expect(screen.getByRole("combobox", { name: "Curso" })).toHaveTextContent("Todos los cursos"));
  expect(screen.getByText("5 cambios pendientes en la selección.")).toBeInTheDocument();
});

it("marks a failed batch as uncertain and keeps publishing the remaining batches", async () => {
  const user = userEvent.setup();
  const publishAction = jest.mocked(publishBulkInstitutionalGradesAction);

  const manyClasses: PendingClassGrades[] = Array.from({ length: 25 }, (_, index) => ({
    courseId: "course-1",
    courseName: "Lenguaje",
    classId: `class-${index + 1}`,
    classLabel: `Clase ${String(index + 1).padStart(2, "0")}`,
    pendingChanges: 1,
    affectedStudents: 1,
  }));

  publishAction
    .mockReset()
    .mockRejectedValueOnce(new Error("network"))
    .mockImplementation(async (batch: string[]) => ({
      publishedClasses: batch.length,
      publishedGrades: batch.length,
      deletedGrades: 0,
      affectedStudents: batch.length,
      results: batch.map((classId) => ({ classId, status: "published" as const, publishedGrades: 1, deletedGrades: 0, affectedStudents: 1 })),
    }));

  const props = renderForm({ classes: manyClasses });

  await user.click(screen.getByRole("button", { name: "Publicar notas" }));

  expect(await screen.findByText("Se publicaron 5 de 25 clases.")).toBeInTheDocument();
  expect(publishAction).toHaveBeenCalledTimes(2);
  expect(publishAction.mock.calls[1][0]).toEqual(manyClasses.slice(20).map((entry) => entry.classId));
  expect(screen.getAllByText(/Sin confirmar — /)).toHaveLength(20);
  expect(screen.getAllByText(/Publicada — 1 nota publicada/)).toHaveLength(5);
  expect(props.onPublished).toHaveBeenCalledTimes(1);
  expect(props.onRefreshPendingClasses).toHaveBeenCalledTimes(1);
  expect(props.onReportAvailable).toHaveBeenCalledTimes(1);
  expect(props.onOpenChange).not.toHaveBeenCalled();
});

it("renders an all-failed report without claiming success", async () => {
  const user = userEvent.setup();
  const publishAction = jest.mocked(publishBulkInstitutionalGradesAction);

  publishAction.mockReset().mockResolvedValueOnce({
    error: "No se pudieron publicar las notas.",
    failedClasses: 3,
    results: [
      { classId: "class-1", status: "failed", error: "La clase no se pudo publicar (HTTP 500)." },
      { classId: "class-2", status: "failed", error: "La clase no se pudo publicar (HTTP 500)." },
      { classId: "class-3", status: "failed", error: "La clase no se pudo publicar (HTTP 500)." },
    ],
  });

  const gradesChanged = jest.fn();
  window.addEventListener(GRADES_CHANGED_EVENT, gradesChanged);

  const props = renderForm();

  await user.click(screen.getByRole("button", { name: "Publicar notas" }));

  expect(await screen.findByText("Se publicaron 0 de 3 clases.")).toBeInTheDocument();
  expect(screen.getByText("No se pudieron publicar las notas.")).toBeInTheDocument();
  expect(screen.getAllByText(/Falló — La clase no se pudo publicar \(HTTP 500\)\./)).toHaveLength(3);
  expect(props.onOpenChange).not.toHaveBeenCalled();
  expect(props.onPublished).not.toHaveBeenCalled();
  expect(props.onRefreshPendingClasses).toHaveBeenCalledTimes(1);
  expect(gradesChanged).not.toHaveBeenCalled();

  window.removeEventListener(GRADES_CHANGED_EVENT, gradesChanged);
});

it("sends only the still-pending classes on a deliberate retry after a refresh", async () => {
  const user = userEvent.setup();
  const publishAction = jest.mocked(publishBulkInstitutionalGradesAction);

  publishAction
    .mockReset()
    .mockResolvedValueOnce({
      publishedClasses: 1,
      publishedGrades: 2,
      deletedGrades: 0,
      affectedStudents: 2,
      failedClasses: 1,
      uncertainClasses: 1,
      uncertainClassIds: ["class-3"],
      results: [
        { classId: "class-1", status: "published", publishedGrades: 2, deletedGrades: 0, affectedStudents: 2 },
        { classId: "class-2", status: "failed", error: "La clase no se pudo publicar (HTTP 500)." },
        { classId: "class-3", status: "uncertain", error: "Sin respuesta del servidor." },
      ],
    })
    .mockResolvedValueOnce({
      publishedClasses: 2,
      publishedGrades: 2,
      deletedGrades: 0,
      affectedStudents: 2,
      results: [
        { classId: "class-2", status: "published", publishedGrades: 1, deletedGrades: 0, affectedStudents: 1 },
        { classId: "class-3", status: "published", publishedGrades: 1, deletedGrades: 0, affectedStudents: 1 },
      ],
    });

  const baseProps = {
    isRefreshing: false,
    refreshError: null,
    onRefreshPendingClasses: jest.fn(),
    onOpenChange: jest.fn(),
    onPublished: jest.fn(),
    onPendingChange: jest.fn(),
    onReportAvailable: jest.fn(),
  };

  const { rerender } = render(<BulkPublishGradesForm {...baseProps} classes={pendingClasses} />);

  await user.click(screen.getByRole("button", { name: "Publicar notas" }));

  expect(await screen.findByText("Se publicaron 1 de 3 clases.")).toBeInTheDocument();
  expect(baseProps.onRefreshPendingClasses).toHaveBeenCalledTimes(1);

  rerender(<BulkPublishGradesForm {...baseProps} classes={pendingClasses.slice(1)} />);

  await user.click(screen.getByRole("button", { name: "Publicar notas" }));

  await waitFor(() => expect(baseProps.onOpenChange).toHaveBeenCalledWith(false));
  expect(publishAction).toHaveBeenCalledTimes(2);
  expect(publishAction.mock.calls[1][0]).not.toContain("class-1");
  expect([...publishAction.mock.calls[1][0]].sort()).toEqual(["class-2", "class-3"]);
});
