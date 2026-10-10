import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { deleteAcademicResourceAction } from "@features/academic/actions/academic-resource-lifecycle.actions";
import { AcademicDeleteButton } from "@features/academic/components/academic-delete-button";
import { AcademicResource } from "@features/academic/types/academic-resource.types";
import { AcademicScope } from "@features/academic/utils/academic-scope.util";

jest.mock("@features/academic/actions/academic-resource-lifecycle.actions", () => ({
  deleteAcademicResourceAction: jest.fn(),
}));

const PROPS = {
  destination: "/study-plans?page=1",
  id: "019f9c3a-f891-7bc5-a98d-e65332998126",
  institutionId: "019f9c3a-f891-7bc5-a98d-e65332998127",
  label: "el nivel Nivel 1",
  resource: AcademicResource.ACADEMIC_LEVEL,
  scope: AcademicScope.INSTITUTIONAL,
} as const;

it("locks deletion while pending, preserves a rejected dialog and resets the error on reopening", async () => {
  const user = userEvent.setup();
  let finishDelete: ((state: { error: string }) => void) | undefined;
  jest
    .mocked(deleteAcademicResourceAction)
    .mockReset()
    .mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          finishDelete = resolve;
        }),
    );
  render(<AcademicDeleteButton {...PROPS} />);

  await user.click(screen.getByRole("button", { name: "Eliminar" }));
  const dialog = screen.getByRole("alertdialog");
  expect(within(dialog).getByRole("heading")).toHaveTextContent("Eliminar el nivel Nivel 1");
  await user.click(within(dialog).getByRole("button", { name: "Eliminar" }));

  await waitFor(() => expect(within(dialog).getByRole("button", { name: "Eliminando…" })).toBeDisabled());
  const cancel = within(dialog).getByRole("button", { name: "Cancelar" });
  expect(cancel).toBeDisabled();
  await user.click(cancel);
  expect(screen.getByRole("alertdialog")).toBe(dialog);
  expect(deleteAcademicResourceAction).toHaveBeenCalledTimes(1);
  expect(deleteAcademicResourceAction).toHaveBeenCalledWith(
    "institutional",
    PROPS.institutionId,
    "academic-levels",
    PROPS.id,
    "/study-plans?page=1",
    {},
    expect.any(FormData),
  );

  if (!finishDelete) {
    throw new Error("Deletion was not submitted");
  }

  finishDelete({ error: "No se puede eliminar un nivel utilizado." });
  expect(await screen.findByRole("alert")).toHaveTextContent("No se puede eliminar un nivel utilizado.");
  expect(screen.getByRole("alertdialog")).toBe(dialog);
  expect(cancel).not.toBeDisabled();

  await user.click(cancel);
  expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
  await user.click(screen.getByRole("button", { name: "Eliminar" }));

  expect(screen.getByRole("alertdialog")).toBeInTheDocument();
  expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  expect(deleteAcademicResourceAction).toHaveBeenCalledTimes(1);
});
