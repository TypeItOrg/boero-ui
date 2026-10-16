import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { CourseEnrollmentGradeDeleteDialog } from "@features/course-enrollments/components/course-enrollment-grade-delete-dialog";
import type { CourseEnrollmentGrade } from "@features/course-enrollments/types/course-enrollment-grade.types";

const draftGrade = {
  id: "grade-1",
  evaluation: "Parcial 1",
  value: 8,
  publicationStatus: "DRAFT",
  version: 3,
} as CourseEnrollmentGrade;

const pendingDeletionGrade = {
  id: "grade-2",
  evaluation: "Parcial 2",
  value: 7,
  publicationStatus: "PENDING_DELETION",
  version: 1,
} as CourseEnrollmentGrade;

it("locks the dialog while pending, keeps the error open and resets it on reopening another grade", async () => {
  const user = userEvent.setup();
  const onOpenChange = jest.fn();
  const onDeleted = jest.fn();
  let finishDelete: ((state: { error?: string }) => void) | undefined;
  const onConfirm = jest.fn(
    () =>
      new Promise<{ error?: string }>((resolve) => {
        finishDelete = resolve;
      }),
  );

  const { rerender } = render(
    <CourseEnrollmentGradeDeleteDialog grade={draftGrade} onOpenChange={onOpenChange} onConfirm={onConfirm} onDeleted={onDeleted} />,
  );

  await user.click(screen.getByRole("button", { name: "Confirmar" }));

  await waitFor(() => expect(screen.getByRole("button", { name: "Eliminando…" })).toBeDisabled());

  const cancel = screen.getByRole("button", { name: "Cancelar" });
  expect(cancel).toBeDisabled();
  await user.click(cancel);
  expect(onOpenChange).not.toHaveBeenCalled();

  await user.click(screen.getByRole("button", { name: "Eliminando…" }));
  expect(onConfirm).toHaveBeenCalledTimes(1);

  if (!finishDelete) {
    throw new Error("Deletion was not submitted");
  }

  finishDelete({ error: "No se pudo eliminar la nota." });

  expect(await screen.findByRole("alert")).toHaveTextContent("No se pudo eliminar la nota.");
  expect(screen.getByRole("button", { name: "Confirmar" })).toBeEnabled();
  expect(onDeleted).not.toHaveBeenCalled();

  rerender(<CourseEnrollmentGradeDeleteDialog grade={null} onOpenChange={onOpenChange} onConfirm={onConfirm} onDeleted={onDeleted} />);

  expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();

  rerender(
    <CourseEnrollmentGradeDeleteDialog grade={pendingDeletionGrade} onOpenChange={onOpenChange} onConfirm={onConfirm} onDeleted={onDeleted} />,
  );

  expect(screen.getByRole("alertdialog")).toBeInTheDocument();
  expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  expect(screen.getByText(/seguirá visible para el estudiante/)).toBeInTheDocument();
});

it("confirms once and reports the deleted grade on success", async () => {
  const user = userEvent.setup();
  const onDeleted = jest.fn();
  const onConfirm = jest.fn().mockResolvedValue({});

  render(<CourseEnrollmentGradeDeleteDialog grade={draftGrade} onOpenChange={jest.fn()} onConfirm={onConfirm} onDeleted={onDeleted} />);

  await user.click(screen.getByRole("button", { name: "Confirmar" }));

  await waitFor(() => expect(onDeleted).toHaveBeenCalledWith(draftGrade));
  expect(onConfirm).toHaveBeenCalledTimes(1);
  expect(onConfirm).toHaveBeenCalledWith(draftGrade);
  expect(screen.queryByRole("alert")).not.toBeInTheDocument();
});
