import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { updateAcademicStatusAction } from "@features/academic/actions/academic-resource.action";
import { ActiveAcademicStatusButton, ActiveAcademicStatusDialog } from "@features/academic/components/active-academic-status-dialog";
import { AcademicResource } from "@features/academic/types/academic-resource.types";
import { AcademicScope } from "@features/academic/utils/academic-scope.util";

jest.mock("@features/academic/actions/academic-resource.action", () => ({
  updateAcademicStatusAction: jest.fn(),
}));

const INSTITUTION_ID = "019f9c3a-f891-7bc5-a98d-e65332998127";
const RESOURCE_ID = "019f9c3a-f891-7bc5-a98d-e65332998126";

describe("ActiveAcademicStatusDialog", () => {
  beforeEach(() => {
    jest.mocked(updateAcademicStatusAction).mockReset().mockResolvedValue({});
  });

  it.each([
    [AcademicResource.TRAINING_PATH, "Profesorado", "Desactivar trayecto formativo"],
    [AcademicResource.ACADEMIC_SPACE, "Armonía", "Desactivar espacio académico"],
    [AcademicResource.INSTRUMENT, "Piano", "Desactivar instrumento"],
    [AcademicResource.SHIFT, "Turno mañana", "Desactivar turno"],
  ] as const)("submits %s deactivation with the boolean contract", async (resource, resourceLabel, actionLabel) => {
    const user = userEvent.setup();

    render(
      <ActiveAcademicStatusDialog
        id={RESOURCE_ID}
        institutionId={INSTITUTION_ID}
        onOpenChange={jest.fn()}
        open
        resource={resource}
        resourceLabel={resourceLabel}
        returnTo={`/${resource}?active=true&page=1`}
        scope={AcademicScope.INSTITUTIONAL}
        targetStatus="INACTIVE"
      />,
    );

    if (resource === AcademicResource.ACADEMIC_SPACE) {
      expect(screen.getByText(/No se podrá desactivar si está utilizado/)).toBeInTheDocument();
    }

    await user.click(screen.getByRole("button", { name: actionLabel }));

    await waitFor(() => expect(updateAcademicStatusAction).toHaveBeenCalledTimes(1));
    expect(updateAcademicStatusAction).toHaveBeenCalledWith(
      "institutional",
      INSTITUTION_ID,
      resource,
      RESOURCE_ID,
      "/" + resource + "?active=true&page=1",
      {},
      expect.any(FormData),
    );
    expect(screen.getByRole("alertdialog")).toBeInTheDocument();
    const submittedFormData = jest.mocked(updateAcademicStatusAction).mock.calls.at(-1)?.at(-1);
    expect(submittedFormData).toBeInstanceOf(FormData);
    expect((submittedFormData as FormData).get("active")).toBe("false");
  });

  it("locks a pending status change, keeps a rejected dialog and clears the error on reopening", async () => {
    const user = userEvent.setup();
    let finishUpdate: ((state: { error: string }) => void) | undefined;
    jest.mocked(updateAcademicStatusAction).mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          finishUpdate = resolve;
        }),
    );
    render(
      <ActiveAcademicStatusButton
        active
        id={RESOURCE_ID}
        institutionId={INSTITUTION_ID}
        resource={AcademicResource.INSTRUMENT}
        resourceLabel="Piano"
        returnTo="/instruments"
        scope={AcademicScope.INSTITUTIONAL}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Desactivar" }));
    const dialog = screen.getByRole("alertdialog");
    await user.click(within(dialog).getByRole("button", { name: "Desactivar instrumento" }));
    await waitFor(() => expect(within(dialog).getByRole("button", { name: "Desactivando…" })).toBeDisabled());
    const cancel = within(dialog).getByRole("button", { name: "Cancelar" });
    expect(cancel).toBeDisabled();
    await user.click(cancel);
    expect(screen.getByRole("alertdialog")).toBe(dialog);
    expect(updateAcademicStatusAction).toHaveBeenCalledTimes(1);

    if (!finishUpdate) {
      throw new Error("Status change was not submitted");
    }

    finishUpdate({ error: "No se puede desactivar el instrumento." });
    expect(await screen.findByRole("alert")).toHaveTextContent("No se puede desactivar el instrumento.");
    expect(screen.getByRole("alertdialog")).toBe(dialog);
    expect(cancel).not.toBeDisabled();

    await user.click(cancel);
    expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Desactivar" }));
    expect(screen.getByRole("alertdialog")).toBeInTheDocument();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    expect(updateAcademicStatusAction).toHaveBeenCalledTimes(1);
  });
});
