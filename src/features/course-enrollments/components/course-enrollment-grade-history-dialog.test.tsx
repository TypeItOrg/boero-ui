import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { CourseEnrollmentGradeHistoryDialog } from "@features/course-enrollments/components/course-enrollment-grade-history-dialog";
import type { CourseEnrollmentGradeHistoryEvent } from "@features/course-enrollments/types/course-enrollment-grade-history-event.types";

import { renderWithQueryClient } from "@/../test/utils/render-with-query-client";

function makeEvent(index: number, gradeId = "g-1"): CourseEnrollmentGradeHistoryEvent {
  return {
    historyId: `h-${gradeId}-${index}`,
    gradeId,
    operation: "UPDATED",
    evaluationBefore: `Prueba ${index}`,
    valueBefore: 7,
    evaluationAfter: `Prueba ${index}`,
    valueAfter: 8,
    publishedEvaluationBefore: null,
    publishedValueBefore: null,
    publishedEvaluationAfter: null,
    publishedValueAfter: null,
    previousStatus: "DRAFT",
    newStatus: "DRAFT",
    actor: { id: "p-1", fullName: "Ana Docente" },
    changedAt: "2026-10-02T10:00:00Z",
  };
}

const events: CourseEnrollmentGradeHistoryEvent[] = [
  {
    ...makeEvent(1),
    historyId: "h-1",
    operation: "CREATED",
    evaluationBefore: null,
    valueBefore: null,
    valueAfter: 7,
    previousStatus: null,
    changedAt: "2026-10-01T10:00:00Z",
  },
  { ...makeEvent(1), historyId: "h-2" },
  {
    ...makeEvent(1),
    historyId: "h-3",
    operation: "PUBLISHED",
    evaluationAfter: null,
    valueAfter: null,
    publishedEvaluationAfter: "Parcial 1",
    publishedValueAfter: 8,
    actor: { id: "p-2", fullName: "Bruno Director" },
    changedAt: "2026-10-03T10:00:00Z",
  },
];

function jsonPage(content: CourseEnrollmentGradeHistoryEvent[], number: number, totalPages: number, totalElements: number, size = 20): Response {
  return {
    ok: true,
    json: async () => ({ content, number, size, totalPages, totalElements }),
  } as Response;
}

function pageFromUrl(url: string): number {
  const match = /[?&]page=(\d+)/.exec(url);

  return match ? Number(match[1]) : 0;
}

function renderDialog(props: { gradeId?: string; gradeLabel?: string; mode?: "institutional" | "teacher"; classId?: string } = {}) {
  return renderWithQueryClient(
    <CourseEnrollmentGradeHistoryDialog
      mode={props.mode ?? "institutional"}
      enrollmentId="e-1"
      classId={props.classId}
      gradeId={props.gradeId ?? "g-1"}
      gradeLabel={props.gradeLabel ?? "Parcial 1"}
      open
      onOpenChange={() => undefined}
    />,
  );
}

describe("CourseEnrollmentGradeHistoryDialog", () => {
  it("renders history table with operations, values and authors", async () => {
    global.fetch = jest.fn().mockResolvedValue(jsonPage(events, 0, 1, events.length));

    renderDialog();

    await waitFor(() => expect(screen.getByText("Nota creada")).toBeInTheDocument());
    expect(screen.getByText("Nota editada")).toBeInTheDocument();
    expect(screen.getByText("Nota publicada")).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: "Fecha y hora" })).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: "Operación" })).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: "Valores resultantes" })).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: "Autor" })).toBeInTheDocument();
    expect(screen.getAllByText(/Ana Docente/).length).toBeGreaterThan(0);
    expect(screen.getByText("Bruno Director")).toBeInTheDocument();
  });

  it("shows the real empty state when the grade has no history", async () => {
    global.fetch = jest.fn().mockResolvedValue(jsonPage([], 0, 0, 0));

    renderDialog();

    await waitFor(() => expect(screen.getByText("Sin historial")).toBeInTheDocument());
    expect(screen.queryByRole("navigation", { name: "Paginación de tabla" })).not.toBeInTheDocument();
  });

  it("shows an error and retries the current page", async () => {
    const user = userEvent.setup();

    global.fetch = jest
      .fn()
      .mockRejectedValueOnce(new Error("network"))
      .mockResolvedValueOnce(jsonPage(events, 0, 1, events.length));

    renderDialog();

    await waitFor(() => expect(screen.getByText(/No se pudieron cargar/)).toBeInTheDocument());

    await user.click(screen.getByRole("button", { name: "Reintentar" }));

    await waitFor(() => expect(screen.getByText("Nota creada")).toBeInTheDocument());
    expect(global.fetch).toHaveBeenCalledTimes(2);
    expect((global.fetch as jest.Mock).mock.calls[1][0]).toContain("page=0&size=20");
  });

  it("paginates every page of a deleted grade with more than 50 events", async () => {
    const user = userEvent.setup();
    const allEvents: CourseEnrollmentGradeHistoryEvent[] = [
      {
        ...makeEvent(65),
        historyId: "h-deleted-published",
        operation: "DELETED_PUBLISHED",
        evaluationAfter: null,
        valueAfter: null,
        previousStatus: "PUBLISHED",
        newStatus: "DELETED",
      },
      ...Array.from({ length: 64 }, (_, index) => makeEvent(index + 1)),
    ];

    global.fetch = jest.fn(async (input: RequestInfo | URL) => {
      const page = pageFromUrl(String(input));

      return jsonPage(allEvents.slice(page * 20, page * 20 + 20), page, 4, allEvents.length);
    });

    renderDialog();

    await waitFor(() => expect(screen.getByText("Página 1 de 4")).toBeInTheDocument());
    expect(screen.getByText("65 eventos.")).toBeInTheDocument();
    expect(screen.getByText("Nota eliminada al publicar")).toBeInTheDocument();
    expect(screen.getAllByText("—")).toHaveLength(1);
    expect(screen.getByText("Prueba 1")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Ir a la primera página" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Ir a la página anterior" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Ir a la página siguiente" })).toBeEnabled();
    expect(screen.getByRole("button", { name: "Ir a la última página" })).toBeEnabled();

    await user.click(screen.getByRole("button", { name: "Ir a la página siguiente" }));

    await waitFor(() => expect(screen.getByText("Página 2 de 4")).toBeInTheDocument());
    expect(screen.getByText("Prueba 20")).toBeInTheDocument();
    expect(screen.queryByText("Nota eliminada al publicar")).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Ir a la página siguiente" }));

    await waitFor(() => expect(screen.getByText("Página 3 de 4")).toBeInTheDocument());
    expect(screen.getByText("Prueba 40")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Ir a la página siguiente" }));

    await waitFor(() => expect(screen.getByText("Página 4 de 4")).toBeInTheDocument());
    expect(screen.getByText("Prueba 64")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Ir a la primera página" })).toBeEnabled();
    expect(screen.getByRole("button", { name: "Ir a la página anterior" })).toBeEnabled();
    expect(screen.getByRole("button", { name: "Ir a la página siguiente" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Ir a la última página" })).toBeDisabled();

    expect(global.fetch).toHaveBeenCalledTimes(4);
    expect((global.fetch as jest.Mock).mock.calls.map(([url]) => String(url)).every((url) => url.includes("size=20"))).toBe(true);
  });

  it("shows an out-of-range page without claiming the grade has no history", async () => {
    const user = userEvent.setup();
    const firstPage = Array.from({ length: 20 }, (_, index) => makeEvent(index + 1));

    global.fetch = jest.fn(async (input: RequestInfo | URL) => {
      const page = pageFromUrl(String(input));

      if (page === 0) {
        return jsonPage(firstPage, 0, 4, 65);
      }

      return jsonPage([], page, 2, 40);
    });

    renderDialog();

    await waitFor(() => expect(screen.getByText("Página 1 de 4")).toBeInTheDocument());
    expect(screen.getByText("65 eventos.")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Ir a la página siguiente" }));

    await waitFor(() => expect(screen.getByText("Esta página no contiene eventos. El historial puede haber cambiado.")).toBeInTheDocument());
    expect(screen.queryByText("Sin historial")).not.toBeInTheDocument();
    expect(screen.getByText("Página 2 de 2")).toBeInTheDocument();
    expect(screen.getByText("40 eventos.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Ir a la página anterior" })).toBeEnabled();
    expect(screen.getByRole("button", { name: "Ir a la página siguiente" })).toBeDisabled();
  });

  it("discards a late history response from the previous grade after switching grades", async () => {
    let resolveGradeA: ((response: Response) => void) | undefined;

    global.fetch = jest.fn((input: RequestInfo | URL) => {
      const url = String(input);

      if (url.includes("grade-a")) {
        return new Promise<Response>((resolve) => {
          resolveGradeA = resolve;
        });
      }

      return Promise.resolve(jsonPage([makeEvent(2, "grade-b")], 0, 1, 1));
    });

    const { rerender } = renderWithQueryClient(
      <CourseEnrollmentGradeHistoryDialog
        mode="institutional"
        enrollmentId="e-1"
        gradeId="grade-a"
        gradeLabel="Tema A"
        open
        onOpenChange={() => undefined}
      />,
    );

    expect(screen.queryByText("Prueba 1")).not.toBeInTheDocument();

    rerender(
      <CourseEnrollmentGradeHistoryDialog
        mode="institutional"
        enrollmentId="e-1"
        gradeId="grade-b"
        gradeLabel="Tema B"
        open
        onOpenChange={() => undefined}
      />,
    );

    await waitFor(() => expect(screen.getByText("Prueba 2")).toBeInTheDocument());
    expect(screen.getByText("1 evento.")).toBeInTheDocument();

    const requestedUrls = (global.fetch as jest.Mock).mock.calls.map(([url]) => String(url));

    expect(requestedUrls.some((url) => url.includes("grade-a"))).toBe(true);

    resolveGradeA?.(jsonPage([makeEvent(1, "grade-a")], 0, 1, 1));

    await new Promise((resolve) => setTimeout(resolve, 50));

    expect(screen.queryByText("Prueba 1")).not.toBeInTheDocument();
    expect(screen.getByText("Prueba 2")).toBeInTheDocument();
  });

  it("keeps the dialog open and retries the failed page 2", async () => {
    const user = userEvent.setup();
    const allEvents = Array.from({ length: 45 }, (_, index) => makeEvent(index + 1));
    let shouldFailPageTwo = true;

    global.fetch = jest.fn(async (input: RequestInfo | URL) => {
      const page = pageFromUrl(String(input));

      if (page === 1 && shouldFailPageTwo) {
        shouldFailPageTwo = false;

        throw new Error("network");
      }

      return jsonPage(allEvents.slice(page * 20, page * 20 + 20), page, 3, allEvents.length);
    });

    renderDialog();

    await waitFor(() => expect(screen.getByText("Página 1 de 3")).toBeInTheDocument());
    expect(screen.getByText("45 eventos.")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Ir a la página siguiente" }));

    await waitFor(() => expect(screen.getByText(/No se pudieron cargar/)).toBeInTheDocument());
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Ir a la página anterior" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Ir a la página siguiente" })).toBeDisabled();

    await user.click(screen.getByRole("button", { name: "Reintentar" }));

    await waitFor(() => expect(screen.getByText("Página 2 de 3")).toBeInTheDocument());
    expect(screen.getByText("Prueba 21")).toBeInTheDocument();
    expect(global.fetch).toHaveBeenCalledTimes(3);
    expect((global.fetch as jest.Mock).mock.calls[2][0]).toContain("page=1&size=20");
  });

  it("disables the footer controls while the next page is loading", async () => {
    const user = userEvent.setup();
    const allEvents = Array.from({ length: 45 }, (_, index) => makeEvent(index + 1));
    let resolvePageTwo: ((response: Response) => void) | undefined;

    global.fetch = jest.fn((input: RequestInfo | URL) => {
      const page = pageFromUrl(String(input));

      if (page === 1) {
        return new Promise<Response>((resolve) => {
          resolvePageTwo = resolve;
        });
      }

      return Promise.resolve(jsonPage(allEvents.slice(0, 20), 0, 3, allEvents.length));
    });

    renderDialog();

    await waitFor(() => expect(screen.getByText("Página 1 de 3")).toBeInTheDocument());

    await user.click(screen.getByRole("button", { name: "Ir a la página siguiente" }));

    await waitFor(() => expect(screen.getByRole("button", { name: "Ir a la página siguiente" })).toBeDisabled());
    expect(screen.getByRole("button", { name: "Ir a la primera página" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Ir a la página anterior" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Ir a la última página" })).toBeDisabled();
    expect(screen.getByRole("combobox")).toBeDisabled();

    resolvePageTwo?.(jsonPage(allEvents.slice(20, 40), 1, 3, allEvents.length));

    await waitFor(() => expect(screen.getByRole("button", { name: "Ir a la página siguiente" })).toBeEnabled());
    expect(screen.getByText("Prueba 21")).toBeInTheDocument();
  });

  it("keeps the teacher class scope on every page", async () => {
    const user = userEvent.setup();
    const allEvents = Array.from({ length: 45 }, (_, index) => makeEvent(index + 1));

    global.fetch = jest.fn(async (input: RequestInfo | URL) => {
      const page = pageFromUrl(String(input));

      return jsonPage(allEvents.slice(page * 20, page * 20 + 20), page, 3, allEvents.length);
    });

    renderDialog({ mode: "teacher", classId: "c-9" });

    await waitFor(() => expect(screen.getByText("Página 1 de 3")).toBeInTheDocument());

    await user.click(screen.getByRole("button", { name: "Ir a la página siguiente" }));

    await waitFor(() => expect(screen.getByText("Página 2 de 3")).toBeInTheDocument());

    const urls = (global.fetch as jest.Mock).mock.calls.map(([url]) => String(url));

    expect(urls.every((url) => url.startsWith("/api/teacher/classes/c-9/enrollments/e-1/grades/g-1/history"))).toBe(true);
    expect(urls[urls.length - 1]).toContain("page=1&size=20");
  });

  it("restarts at the first page when the page size changes", async () => {
    const user = userEvent.setup();
    const allEvents = Array.from({ length: 45 }, (_, index) => makeEvent(index + 1));

    global.fetch = jest.fn(async (input: RequestInfo | URL) => {
      const url = String(input);
      const page = pageFromUrl(url);
      const size = Number(/[?&]size=(\d+)/.exec(url)?.[1] ?? 20);

      return jsonPage(allEvents.slice(page * size, page * size + size), page, Math.ceil(allEvents.length / size), allEvents.length, size);
    });

    renderDialog();

    await waitFor(() => expect(screen.getByText("Página 1 de 3")).toBeInTheDocument());
    expect(screen.getByRole("combobox")).toHaveTextContent("20");

    await user.click(screen.getByRole("button", { name: "Ir a la página siguiente" }));

    await waitFor(() => expect(screen.getByText("Página 2 de 3")).toBeInTheDocument());
    expect(screen.queryByText("Prueba 45")).not.toBeInTheDocument();

    await user.click(screen.getByRole("combobox"));

    expect(screen.getAllByRole("option").map((option) => option.textContent)).toEqual(["10", "20", "30", "40", "50"]);

    await user.click(screen.getByRole("option", { name: "50" }));

    await waitFor(() => expect(screen.getByText("Página 1 de 1")).toBeInTheDocument());
    expect(screen.getByText("45 eventos.")).toBeInTheDocument();
    expect(screen.getByText("Prueba 45")).toBeInTheDocument();
    expect(screen.getByRole("combobox")).toHaveTextContent("50");

    await user.click(screen.getByRole("combobox"));

    await user.click(screen.getByRole("option", { name: "30" }));

    await waitFor(() => expect(screen.getByText("Página 1 de 2")).toBeInTheDocument());
    expect(screen.queryByText("Prueba 45")).not.toBeInTheDocument();

    const urls = (global.fetch as jest.Mock).mock.calls.map(([url]) => String(url));

    expect(urls[urls.length - 2]).toContain("page=0&size=50");
    expect(urls[urls.length - 1]).toContain("page=0&size=30");
  });
});
