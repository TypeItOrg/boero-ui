import { render, screen, fireEvent } from "@testing-library/react";

import { InstitutionalUnavailableView } from "@features/institutional-auth/components/institutional-unavailable-view";

describe("InstitutionalUnavailableView", () => {
  it("explains unavailable access and offers a retry and the default home", () => {
    const onRetry = jest.fn();
    render(<InstitutionalUnavailableView onRetry={onRetry} />);

    expect(screen.getByText("Acceso institucional no disponible")).toBeInTheDocument();
    expect(
      screen.getByText(
        "Verificá que el enlace o subdominio ingresado sea correcto, o comunicate con la institución para acceder al portal correspondiente.",
      ),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Ir al inicio/i })).toHaveAttribute("href", "/");
    fireEvent.click(screen.getByRole("button", { name: /Reintentar/i }));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it("renders a custom message and homeHref when provided", () => {
    const customMessage = "No se pudo consultar la institución. Intentá nuevamente.";
    const customHome = "https://app.example.com";

    render(<InstitutionalUnavailableView message={customMessage} homeHref={customHome} />);

    expect(screen.getByText(customMessage)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Ir al inicio/i })).toHaveAttribute("href", customHome);
  });
});
