import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

jest.mock("@features/academic/actions/academic-resource.action", () => ({
  updateAcademicStatusAction: jest.fn(),
}));

import { updateAcademicStatusAction } from "@features/academic/actions/academic-resource.action";
import {
  ActiveAcademicStatusButton,
  ActiveAcademicStatusDialog,
} from "@features/academic/components/active-academic-status-dialog";
import { AcademicResource } from "@features/academic/types/academic-resource.types";
import { AcademicScope } from "@features/academic/utils/academic-scope.util";

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

    await user.click(screen.getByRole("button", { name: actionLabel }));

    await waitFor(() => expect(updateAcademicStatusAction).toHaveBeenCalled());
    expect(screen.getByRole("alertdialog")).toBeInTheDocument();
    const submittedFormData = jest.mocked(updateAcademicStatusAction).mock.calls.at(-1)?.at(-1);
    expect(submittedFormData).toBeInstanceOf(FormData);
    expect((submittedFormData as FormData).get("active")).toBe("false");
  });

  it("keeps the dialog open when the action returns an error", async () => {
    const user = userEvent.setup();
    jest.mocked(updateAcademicStatusAction).mockResolvedValueOnce({ error: "No se puede desactivar el instrumento." });

    render(<StatusDialog resource={AcademicResource.INSTRUMENT} resourceLabel="Piano" />);

    await user.click(screen.getByRole("button", { name: "Desactivar instrumento" }));

    await waitFor(() => expect(screen.getByText("No se puede desactivar el instrumento.")).toBeInTheDocument());
    expect(screen.getByRole("alertdialog")).toBeInTheDocument();
  });

  it("disables its controls while the update is pending", async () => {
    const user = userEvent.setup();
    let resolveUpdate: (state: object) => void = () => undefined;
    jest
      .mocked(updateAcademicStatusAction)
      .mockImplementationOnce(() => new Promise((resolve) => (resolveUpdate = resolve)));

    render(<StatusDialog resource={AcademicResource.INSTRUMENT} resourceLabel="Piano" />);

    await user.click(screen.getByRole("button", { name: "Desactivar instrumento" }));

    await waitFor(() => expect(screen.getByRole("button", { name: "Desactivando…" })).toBeDisabled());
    expect(screen.getByRole("button", { name: "Cancelar" })).toBeDisabled();

    resolveUpdate({});
    await waitFor(() => expect(screen.getByRole("button", { name: "Desactivar instrumento" })).not.toBeDisabled());
  });

  it("shows the academic-space constraint in the shared configuration", () => {
    render(<StatusDialog resource={AcademicResource.ACADEMIC_SPACE} resourceLabel="Armonía" />);

    expect(screen.getByText(/No se podrá desactivar si está utilizado/)).toBeInTheDocument();
  });

  it("resets a returned error after the button closes and reopens the dialog", async () => {
    const user = userEvent.setup();
    jest
      .mocked(updateAcademicStatusAction)
      .mockResolvedValueOnce({ error: "No se puede desactivar el instrumento." })
      .mockResolvedValue({});

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
    await user.click(screen.getByRole("button", { name: "Desactivar instrumento" }));
    await waitFor(() => expect(screen.getByText("No se puede desactivar el instrumento.")).toBeInTheDocument());

    await user.click(screen.getByRole("button", { name: "Cancelar" }));
    expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Desactivar" }));
    expect(screen.queryByText("No se puede desactivar el instrumento.")).not.toBeInTheDocument();
  });
});

function StatusDialog({
  resource,
  resourceLabel,
}: {
  resource: AcademicResource.ACADEMIC_SPACE | AcademicResource.INSTRUMENT;
  resourceLabel: string;
}): React.ReactElement {
  return (
    <ActiveAcademicStatusDialog
      id={RESOURCE_ID}
      institutionId={INSTITUTION_ID}
      onOpenChange={jest.fn()}
      open
      resource={resource}
      resourceLabel={resourceLabel}
      returnTo={`/${resource}`}
      scope={AcademicScope.INSTITUTIONAL}
      targetStatus="INACTIVE"
    />
  );
}
