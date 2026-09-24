import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

jest.mock("@features/guardian-dependents/actions/unlink-guardian-dependent.action", () => ({
  unlinkGuardianDependentAction: jest.fn(),
}));

import { unlinkGuardianDependentAction } from "@features/guardian-dependents/actions/unlink-guardian-dependent.action";
import { UnlinkGuardianDependentDialog } from "@features/guardian-dependents/components/unlink-guardian-dependent-dialog";
import { GUARDIAN_DEPENDENT_MESSAGES } from "@features/guardian-dependents/constants/guardian-dependent.constants";

const INSTITUTION_ID = "019f9c3a-f891-7bc5-a98d-e65332998127";
const DEPENDENT_ID = "019f9c3a-f891-7bc5-a98d-e65332998002";

const mockedAction = jest.mocked(unlinkGuardianDependentAction);

function renderDialog(overrides: { onClose?: () => void; onSuccess?: () => void } = {}): void {
  render(
    <UnlinkGuardianDependentDialog
      dependentName="Mateo Gonzalez"
      dependentPersonId={DEPENDENT_ID}
      institutionId={INSTITUTION_ID}
      onClose={overrides.onClose ?? jest.fn()}
      onSuccess={overrides.onSuccess ?? jest.fn()}
    />,
  );
}

describe("UnlinkGuardianDependentDialog", () => {
  beforeEach(() => {
    mockedAction.mockReset();
  });

  it("names the dependent being removed", () => {
    renderDialog();

    expect(screen.getByRole("alertdialog")).toHaveTextContent("Mateo Gonzalez");
  });

  it("unlinks the dependent and reports success", async () => {
    const onSuccess = jest.fn();
    mockedAction.mockResolvedValue({ success: true });
    renderDialog({ onSuccess });

    await userEvent.setup().click(screen.getByRole("button", { name: "Quitar" }));

    await waitFor(() => expect(onSuccess).toHaveBeenCalledTimes(1));
    expect(mockedAction).toHaveBeenCalledWith(INSTITUTION_ID, DEPENDENT_ID);
  });

  it("stays open and shows the backend error", async () => {
    const onSuccess = jest.fn();
    mockedAction.mockResolvedValue({ error: "Tiene inscripciones activas." });
    renderDialog({ onSuccess });

    await userEvent.setup().click(screen.getByRole("button", { name: "Quitar" }));

    expect(await screen.findByText("Tiene inscripciones activas.")).toBeInTheDocument();
    expect(onSuccess).not.toHaveBeenCalled();
  });

  it("shows a generic error when the action throws", async () => {
    mockedAction.mockRejectedValue(new Error("boom"));
    renderDialog();

    await userEvent.setup().click(screen.getByRole("button", { name: "Quitar" }));

    expect(await screen.findByText(GUARDIAN_DEPENDENT_MESSAGES.UNLINK)).toBeInTheDocument();
  });

  it("disables the controls while pending", async () => {
    mockedAction.mockReturnValue(new Promise(() => undefined));
    renderDialog();

    await userEvent.setup().click(screen.getByRole("button", { name: "Quitar" }));

    expect(await screen.findByRole("button", { name: "Quitando…" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Cancelar" })).toBeDisabled();
  });

  it("closes from cancel", async () => {
    const onClose = jest.fn();
    renderDialog({ onClose });

    await userEvent.setup().click(screen.getByRole("button", { name: "Cancelar" }));

    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
