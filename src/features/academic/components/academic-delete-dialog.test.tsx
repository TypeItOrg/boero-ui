import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

jest.mock("@features/academic/actions/academic-resource.action", () => ({
  deleteAcademicResourceAction: jest.fn(),
}));

import { deleteAcademicResourceAction } from "@features/academic/actions/academic-resource.action";
import { AcademicDeleteButton } from "@features/academic/components/academic-delete-button";
import { AcademicDeleteDialog } from "@features/academic/components/academic-delete-dialog";
import { AcademicResource } from "@features/academic/types/academic-resource.types";
import { AcademicScope } from "@features/academic/utils/academic-scope.util";

const PROPS = {
  destination: "/study-plans?page=1",
  id: "019f9c3a-f891-7bc5-a98d-e65332998126",
  institutionId: "019f9c3a-f891-7bc5-a98d-e65332998127",
  label: "el plan de estudio Plan 2027",
  resource: AcademicResource.STUDY_PLAN,
  scope: AcademicScope.INSTITUTIONAL,
} as const;

const BUTTON_PROPS = {
  ...PROPS,
  resource: AcademicResource.ACADEMIC_LEVEL,
} as const;

describe("AcademicDeleteDialog", () => {
  beforeEach(() => {
    jest.mocked(deleteAcademicResourceAction).mockReset().mockResolvedValue({});
  });

  it("keeps the dialog open when deletion returns an error", async () => {
    const user = userEvent.setup();
    jest.mocked(deleteAcademicResourceAction).mockResolvedValueOnce({ error: "No se pudo eliminar el plan activo." });

    render(<AcademicDeleteDialog {...PROPS} onOpenChange={jest.fn()} open />);

    await user.click(screen.getByRole("button", { name: "Eliminar" }));

    await waitFor(() => expect(screen.getByText("No se pudo eliminar el plan activo.")).toBeInTheDocument());
    expect(screen.getByRole("alertdialog")).toBeInTheDocument();
  });

  it("disables its controls while deletion is pending", async () => {
    const user = userEvent.setup();
    let resolveDelete: (state: object) => void = () => undefined;
    jest
      .mocked(deleteAcademicResourceAction)
      .mockImplementationOnce(() => new Promise((resolve) => (resolveDelete = resolve)));

    render(<AcademicDeleteDialog {...PROPS} onOpenChange={jest.fn()} open />);

    await user.click(screen.getByRole("button", { name: "Eliminar" }));

    await waitFor(() => expect(screen.getByRole("button", { name: "Eliminando…" })).toBeDisabled());
    expect(screen.getByRole("button", { name: "Cancelar" })).toBeDisabled();

    resolveDelete({});
    await waitFor(() => expect(screen.getByRole("button", { name: "Eliminar" })).not.toBeDisabled());
  });

  it("resets a returned error when reopening from its trigger", async () => {
    const user = userEvent.setup();
    jest.mocked(deleteAcademicResourceAction).mockResolvedValueOnce({ error: "No se pudo eliminar el plan activo." });

    render(<AcademicDeleteButton {...BUTTON_PROPS} />);

    await user.click(screen.getByRole("button", { name: "Eliminar" }));
    await user.click(screen.getByRole("button", { name: "Eliminar" }));
    await waitFor(() => expect(screen.getByText("No se pudo eliminar el plan activo.")).toBeInTheDocument());

    await user.click(screen.getByRole("button", { name: "Cancelar" }));
    await user.click(screen.getByRole("button", { name: "Eliminar" }));

    expect(screen.queryByText("No se pudo eliminar el plan activo.")).not.toBeInTheDocument();
  });
});
