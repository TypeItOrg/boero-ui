import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { resolveGuardianLinkAction } from "@features/guardian-links/actions/resolve-guardian-link.action";
import { GuardianLinkRequests } from "@features/guardian-links/components/guardian-link-requests";
import type { GuardianLinkRequest } from "@features/guardian-links/types/guardian-link-request.types";

jest.mock("@features/guardian-links/actions/resolve-guardian-link.action", () => ({
  resolveGuardianLinkAction: jest.fn(),
}));

const INSTITUTION_ID = "019f9c3a-f891-7bc5-a98d-e65332998127";

function buildRequest(overrides: Partial<GuardianLinkRequest> = {}): GuardianLinkRequest {
  return {
    personGuardianId: "019f9c3a-f891-7bc5-a98d-e65332998001",
    status: "PENDING",
    relationship: "LEGAL_GUARDIAN",
    tutor: { personId: "t1", documentNumber: "35123456", firstName: "Ana", lastName: "García", birthDate: null },
    dependent: { personId: "d1", documentNumber: "54123456", firstName: "Mateo", lastName: "González", birthDate: "2018-09-10" },
    createdAt: "2026-09-24T12:00:00Z",
    resolvedAt: null,
    attachments: [{ id: "a1", originalFileName: "tutela.pdf", contentType: "application/pdf", size: 2048, createdAt: "2026-09-24T12:00:00Z" }],
    ...overrides,
  };
}

describe("GuardianLinkRequests", () => {
  beforeEach(() => {
    jest.mocked(resolveGuardianLinkAction).mockReset().mockResolvedValue({ success: true });
  });

  it("shows tutor, person, declared relationship and the supporting documents", () => {
    render(<GuardianLinkRequests institutionId={INSTITUTION_ID} requests={[buildRequest()]} />);

    expect(screen.getByText("Ana García")).toBeInTheDocument();
    expect(screen.getByText("DNI 35123456")).toBeInTheDocument();
    expect(screen.getByText("Mateo González")).toBeInTheDocument();
    expect(screen.getByText("DNI 54123456")).toBeInTheDocument();
    expect(screen.getByText(/10\/09\/2018/)).toBeInTheDocument();
    expect(screen.getByText(/ años$/)).toBeInTheDocument();
    expect(screen.getByText("Tutor legal")).toBeInTheDocument();
    const document = screen.getByRole("link", { name: /tutela\.pdf/ });
    expect(document).toHaveAttribute("href", "/api/institutional/guardian-links/019f9c3a-f891-7bc5-a98d-e65332998001/attachments/a1/content");
  });

  it("shows the request date with time", () => {
    render(<GuardianLinkRequests institutionId={INSTITUTION_ID} requests={[buildRequest()]} />);

    expect(screen.getByText("24/09/2026 09:00")).toBeInTheDocument();
  });

  it("shows pending, accepted and rejected requests in the default view", () => {
    render(
      <GuardianLinkRequests
        institutionId={INSTITUTION_ID}
        requests={[
          buildRequest(),
          buildRequest({ personGuardianId: "019f9c3a-f891-7bc5-a98d-e65332998002", status: "ACTIVE" }),
          buildRequest({ personGuardianId: "019f9c3a-f891-7bc5-a98d-e65332998003", status: "REJECTED" }),
        ]}
      />,
    );

    expect(screen.getByText("Pendientes")).toBeInTheDocument();
    expect(screen.getByText("Aceptadas")).toBeInTheDocument();
    expect(screen.getByText("Rechazadas")).toBeInTheDocument();
  });

  it("tells when the request has no supporting documents", () => {
    render(<GuardianLinkRequests institutionId={INSTITUTION_ID} requests={[buildRequest({ attachments: [] })]} />);

    expect(screen.getByText("Sin documentación")).toBeInTheDocument();
  });

  it("shows an empty state when nothing is pending", () => {
    render(<GuardianLinkRequests institutionId={INSTITUTION_ID} requests={[]} />);

    expect(screen.getByText("No hay solicitudes de vinculación")).toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: "Nombre de estudiante o tutor" })).toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: "DNI" })).toBeInTheDocument();
    expect(screen.getByRole("combobox", { name: "Filtrar por estado" })).toBeInTheDocument();
  });

  it("uses the search empty state when filters have no matches", async () => {
    const user = userEvent.setup();
    render(<GuardianLinkRequests institutionId={INSTITUTION_ID} requests={[buildRequest()]} />);

    await user.type(screen.getByRole("textbox", { name: "Nombre de estudiante o tutor" }), "Persona inexistente");

    expect(screen.getByText("No se encontraron solicitudes")).toBeInTheDocument();
    expect(screen.getByText("No encontramos solicitudes que coincidan con los filtros.")).toBeInTheDocument();
  });

  it.each([
    ["Aceptar", "approve"],
    ["Rechazar", "reject"],
  ])("sends the %s decision for the request", async (label, decision) => {
    const user = userEvent.setup();
    render(<GuardianLinkRequests institutionId={INSTITUTION_ID} requests={[buildRequest()]} />);

    await user.click(screen.getByRole("button", { name: label }));

    await waitFor(() => expect(resolveGuardianLinkAction).toHaveBeenCalledWith(INSTITUTION_ID, "019f9c3a-f891-7bc5-a98d-e65332998001", decision));
  });

  it("shows the backend error on the request row", async () => {
    const user = userEvent.setup();
    jest.mocked(resolveGuardianLinkAction).mockResolvedValueOnce({ error: "La solicitud de vinculación ya fue resuelta." });
    render(<GuardianLinkRequests institutionId={INSTITUTION_ID} requests={[buildRequest()]} />);

    await user.click(screen.getByRole("button", { name: "Aceptar" }));

    const [row] = screen.getAllByRole("row").slice(1);
    expect(await within(row).findByText("La solicitud de vinculación ya fue resuelta.")).toBeInTheDocument();
  });

  it("filters by either person's name and by DNI", async () => {
    const user = userEvent.setup();
    const secondRequest = buildRequest({
      personGuardianId: "019f9c3a-f891-7bc5-a98d-e65332998002",
      tutor: { ...buildRequest().tutor, firstName: "Laura" },
    });
    render(<GuardianLinkRequests institutionId={INSTITUTION_ID} requests={[buildRequest(), secondRequest]} />);

    await user.type(screen.getByRole("textbox", { name: "Nombre de estudiante o tutor" }), "Laura");
    expect(screen.getByText("Laura García")).toBeInTheDocument();
    expect(screen.queryByText("Ana García")).not.toBeInTheDocument();

    await user.clear(screen.getByRole("textbox", { name: "Nombre de estudiante o tutor" }));
    await user.type(screen.getByRole("textbox", { name: "DNI" }), "35123456");
    expect(screen.getAllByText("Ana García")).toHaveLength(1);
  });

  it("marks a request as rejected after a successful rejection", async () => {
    const user = userEvent.setup();
    render(<GuardianLinkRequests institutionId={INSTITUTION_ID} requests={[buildRequest()]} />);

    await user.click(screen.getByRole("button", { name: "Rechazar" }));

    await user.click(screen.getByRole("combobox", { name: "Filtrar por estado" }));
    await user.click(await screen.findByRole("option", { name: "Rechazadas" }));

    expect(await screen.findAllByText("Rechazadas")).toHaveLength(2);
    expect(screen.queryByRole("button", { name: "Rechazar" })).not.toBeInTheDocument();
  });
});
