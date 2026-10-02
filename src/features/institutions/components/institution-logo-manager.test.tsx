import { act, render, screen, within, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
jest.mock("next/navigation", () => ({ useRouter: () => ({ refresh: jest.fn() }) }));
jest.mock("@features/institutions/actions/institution-logo.actions", () => ({
  uploadPlatformInstitutionLogo: jest.fn(),
  uploadInstitutionalInstitutionLogo: jest.fn(),
  removePlatformInstitutionLogo: jest.fn(),
  removeInstitutionalInstitutionLogo: jest.fn(),
}));
import { InstitutionLogoManager } from "@features/institutions/components/institution-logo-manager";
import {
  uploadPlatformInstitutionLogo,
  uploadInstitutionalInstitutionLogo,
  removePlatformInstitutionLogo,
  removeInstitutionalInstitutionLogo,
} from "@features/institutions/actions/institution-logo.actions";
import type { InstitutionLogoState } from "@features/institutions/types/institution-logo-state.types";
const institutionId = "22222222-2222-4222-8222-222222222222";
const oldLogo = `/api/v1/institutions/${institutionId}/logo?v=old`;
const props = { institutionId, institutionName: "Boero", logoUrl: oldLogo, canUpdate: true };
function deferredLogoAction(): { promise: Promise<InstitutionLogoState>; resolve: (result: InstitutionLogoState) => void } {
  let resolve!: (result: InstitutionLogoState) => void;
  const promise = new Promise<InstitutionLogoState>((complete) => {
    resolve = complete;
  });
  return { promise, resolve };
}

beforeEach(() => {
  // clearMocks only clears calls; action implementations/once queues must be isolated too.
  jest.mocked(uploadPlatformInstitutionLogo).mockReset();
  jest.mocked(uploadInstitutionalInstitutionLogo).mockReset();
  jest.mocked(removePlatformInstitutionLogo).mockReset();
  jest.mocked(removeInstitutionalInstitutionLogo).mockReset();
  URL.createObjectURL = jest.fn(() => "blob:preview");
  URL.revokeObjectURL = jest.fn();
});
it.each(["platform", "institutional"] as const)(
  "[L01.platform-logo-lifecycle] [L02.institution-logo-lifecycle] %s controls replace/preview/remove immediately",
  async (scope) => {
    const upload = scope === "platform" ? uploadPlatformInstitutionLogo : uploadInstitutionalInstitutionLogo;
    const remove = scope === "platform" ? removePlatformInstitutionLogo : removeInstitutionalInstitutionLogo;
    jest.mocked(upload).mockResolvedValue({ success: true, logoUrl: `/api/v1/institutions/${institutionId}/logo?v=new` });
    jest.mocked(remove).mockResolvedValue({ success: true, logoUrl: null });
    render(<InstitutionLogoManager {...props} scope={scope} />);
    const user = userEvent.setup();
    await user.upload(screen.getByLabelText("Imagen del logo"), new File(["PNG bytes"], "logo.png", { type: "image/png" }));
    expect(screen.getByAltText("Vista previa del nuevo logo")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Reemplazar logo" }));
    expect(await screen.findByText("Logo guardado.")).toBeInTheDocument();
    expect(screen.getByAltText("Logo de Boero")).toHaveProperty("src", `http://localhost/api/public/institutions/${institutionId}/logo?v=new`);
    await user.click(screen.getByRole("button", { name: "Eliminar logo" }));
    const dialog = screen.getByRole("dialog");
    await user.click(within(dialog).getByRole("button", { name: "Eliminar logo" }));
    expect(await screen.findByText("Logo eliminado. Se mostrará el nombre de la institución.")).toBeInTheDocument();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(screen.getByText(/Sin logo/)).toBeInTheDocument();
  },
);
it("[L02.logo-authorization] read-only institution exposes no upload/delete controls", () => {
  render(<InstitutionLogoManager {...props} scope="institutional" canUpdate={false} />);
  expect(screen.queryByLabelText("Imagen del logo")).not.toBeInTheDocument();
  expect(screen.queryByRole("button", { name: /logo/ })).not.toBeInTheDocument();
  expect(screen.getByText(/No tenés permiso/)).toBeInTheDocument();
});
it("[L03.replacement-failure] upload pending and failed replacement retain old displayed logo", async () => {
  const deferred = deferredLogoAction();
  jest.mocked(uploadPlatformInstitutionLogo).mockReturnValue(deferred.promise);
  render(<InstitutionLogoManager {...props} scope="platform" />);
  const user = userEvent.setup();
  await user.upload(screen.getByLabelText("Imagen del logo"), new File(["PNG bytes"], "logo.png", { type: "image/png" }));
  await user.click(screen.getByRole("button", { name: "Reemplazar logo" }));
  await waitFor(() => expect(uploadPlatformInstitutionLogo).toHaveBeenCalledTimes(1));
  expect(await screen.findByRole("button", { name: "Guardando…" })).toBeDisabled();
  expect(screen.getByLabelText("Imagen del logo")).toBeDisabled();
  expect(screen.getByAltText("Logo de Boero")).toHaveProperty("src", `http://localhost/api/public/institutions/${institutionId}/logo?v=old`);
  // Settle once; findByText below observes the existing form transition's async completion.
  // A second async act scope around that transition races its native form-action queue.
  act(() => deferred.resolve({ error: "Falló el reemplazo" }));
  expect(await screen.findByText("Falló el reemplazo")).toBeInTheDocument();
  expect(screen.getByAltText("Logo de Boero")).toHaveProperty("src", `http://localhost/api/public/institutions/${institutionId}/logo?v=old`);
});
it("[L02.logo-authorization] removal dialog remains open pending and after an error, and close resets action state", async () => {
  const deferred = deferredLogoAction();
  jest.mocked(removeInstitutionalInstitutionLogo).mockReturnValue(deferred.promise);
  render(<InstitutionLogoManager {...props} scope="institutional" />);
  const user = userEvent.setup();
  await user.click(screen.getByRole("button", { name: "Eliminar logo" }));
  await user.click(within(screen.getByRole("dialog")).getByRole("button", { name: "Eliminar logo" }));
  await waitFor(() => expect(removeInstitutionalInstitutionLogo).toHaveBeenCalledTimes(1));
  expect(await screen.findByRole("button", { name: "Eliminando…" })).toBeDisabled();
  expect(screen.getByRole("button", { name: "Cancelar" })).toBeDisabled();
  act(() => deferred.resolve({ error: "No permitido" }));
  expect(await within(screen.getByRole("dialog")).findByText("No permitido")).toBeInTheDocument();
  await user.click(screen.getByRole("button", { name: "Cancelar" }));
  await user.click(screen.getByRole("button", { name: "Eliminar logo" }));
  expect(screen.queryByText("No permitido")).not.toBeInTheDocument();
});
