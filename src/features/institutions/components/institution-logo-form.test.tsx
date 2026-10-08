import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { InstitutionForm } from "@features/institutions/components/institution-form";
import { InstitutionalInstitutionForm } from "@features/institutions/components/institutional-institution-form";
import { updateInstitutionAction } from "@features/institutions/actions/update-institution.action";
import { updateInstitutionalInstitutionAction } from "@features/institutions/actions/update-institutional-institution.action";
import type { Institution } from "@features/institutions/types/institution.types";
import type { InstitutionActionState } from "@features/institutions/types/institution-action-state.types";

const push = jest.fn();
jest.mock("next/navigation", () => ({ useRouter: () => ({ push }) }));
jest.mock("@features/locations/components/location-picker", () => ({ LocationPicker: () => <div data-testid="location-picker" /> }));
jest.mock("@features/institutions/actions/update-institution.action", () => ({ updateInstitutionAction: jest.fn() }));
jest.mock("@features/institutions/actions/update-institutional-institution.action", () => ({ updateInstitutionalInstitutionAction: jest.fn() }));
jest.mock("@features/institutions/actions/create-institution.action", () => ({ createInstitutionAction: jest.fn() }));

const institution: Institution = {
  id: "22222222-2222-4222-8222-222222222222",
  name: "Boero",
  slug: "boero",
  city: { cityId: "33333333-3333-4333-8333-333333333333", name: "Villa María" },
  province: { provinceId: "44444444-4444-4444-8444-444444444444", name: "Córdoba" },
  country: { countryId: "55555555-5555-4555-8555-555555555555", name: "Argentina", isoCode: "AR" },
  street: null,
  number: null,
  neighborhood: null,
  additionalInfo: null,
  phoneNumber: null,
  email: null,
  active: true,
  userCount: 0,
  publicSubdomain: null,
  logoUrl: "/api/v1/institutions/22222222-2222-4222-8222-222222222222/logo?v=old",
};

function renderForm(scope: "platform" | "institutional") {
  render(
    scope === "platform" ? <InstitutionForm mode="edit" institution={institution} /> : <InstitutionalInstitutionForm institution={institution} />,
  );
  return jest.mocked(scope === "platform" ? updateInstitutionAction : updateInstitutionalInstitutionAction);
}

beforeEach(() => {
  push.mockReset();
  jest.mocked(updateInstitutionAction).mockReset().mockResolvedValue({ success: true });
  jest.mocked(updateInstitutionalInstitutionAction).mockReset().mockResolvedValue({ success: true });
  URL.createObjectURL = jest.fn(() => "blob:preview");
  URL.revokeObjectURL = jest.fn();
});

describe.each(["platform", "institutional"] as const)("%s logo form lifecycle", (scope) => {
  it("previews the replacement locally and submits it only with the form", async () => {
    const update = renderForm(scope);
    const user = userEvent.setup();
    const file = new File(["PNG bytes"], "logo.png", { type: "image/png" });
    await user.upload(screen.getByLabelText("Imagen del logo"), file);

    expect(screen.getByAltText("Vista previa del nuevo logo")).toBeInTheDocument();
    expect(update).not.toHaveBeenCalled();
    await user.click(screen.getByRole("button", { name: "Guardar cambios" }));
    await waitFor(() => expect(push).toHaveBeenCalledTimes(1));

    expect(update).toHaveBeenCalledTimes(1);
    expect(update.mock.calls[0][0]).toBe(institution.id);
    const form = update.mock.calls[0][1];
    expect(form.get("logoIntent")).toBe("replace");
    expect(form.get("logoFile")).toBe(file);
  });

  it("submits removal only when saving and allows undo before submission", async () => {
    const update = renderForm(scope);
    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: "Quitar logo" }));
    expect(screen.getByText("El logo se quitará al guardar los cambios.")).toBeInTheDocument();
    expect(update).not.toHaveBeenCalled();

    await user.click(screen.getByRole("button", { name: /Deshacer/ }));
    expect(screen.getByAltText("Logo de Boero")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Quitar logo" }));
    await user.click(screen.getByRole("button", { name: "Guardar cambios" }));
    await waitFor(() => expect(push).toHaveBeenCalledTimes(1));

    const form = update.mock.calls[0][1];
    expect(form.get("logoIntent")).toBe("remove");
    expect(form.get("logoFile")).toBeNull();
  });

  it("locks the controls while saving and retains the selection after a failed replacement", async () => {
    let resolve!: (state: InstitutionActionState) => void;
    const promise = new Promise<InstitutionActionState>((complete) => {
      resolve = complete;
    });
    const update = renderForm(scope);
    update.mockReturnValue(promise);
    const user = userEvent.setup();
    await user.upload(screen.getByLabelText("Imagen del logo"), new File(["PNG bytes"], "logo.png", { type: "image/png" }));
    await user.click(screen.getByRole("button", { name: "Guardar cambios" }));
    await waitFor(() => expect(update).toHaveBeenCalledTimes(1));

    expect(screen.getByLabelText("Imagen del logo")).toBeDisabled();
    expect(screen.getByRole("button", { name: "Cancelar" })).toBeDisabled();
    expect(push).not.toHaveBeenCalled();
    act(() => resolve({ logoError: "Falló el reemplazo" }));
    expect(await screen.findByText("Falló el reemplazo")).toBeInTheDocument();
    expect(screen.getByAltText("Vista previa del nuevo logo")).toBeInTheDocument();
    expect(push).not.toHaveBeenCalled();

    await user.click(screen.getByRole("button", { name: /Deshacer/ }));
    expect(screen.queryByText("Falló el reemplazo")).not.toBeInTheDocument();
    expect(screen.getByAltText("Logo de Boero")).toHaveProperty("src", `http://localhost/api/public/institutions/${institution.id}/logo?v=old`);
  });
});
