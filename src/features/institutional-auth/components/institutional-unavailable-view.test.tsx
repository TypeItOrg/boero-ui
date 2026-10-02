import { render, screen, fireEvent } from "@testing-library/react";
import { InstitutionalUnavailableView } from "@features/institutional-auth/components/institutional-unavailable-view";

describe("InstitutionalUnavailableView", () => {
  it("renders the title, default message, and action buttons", () => {
    render(<InstitutionalUnavailableView />);

    expect(screen.getByText("Acceso institucional no disponible")).toBeInTheDocument();
    expect(
      screen.getByText(
        "Verificá que el enlace o subdominio ingresado sea correcto, o comunicate con la institución para acceder al portal correspondiente.",
      ),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Reintentar/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Ir al inicio/i })).toHaveAttribute("href", "/");
  });

  it("renders a custom message and homeHref when provided", () => {
    const customMessage = "No se pudo consultar la institución. Intentá nuevamente.";
    const customHome = "https://app.example.com";

    render(<InstitutionalUnavailableView message={customMessage} homeHref={customHome} />);

    expect(screen.getByText(customMessage)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Ir al inicio/i })).toHaveAttribute("href", customHome);
  });

  it("triggers onRetry callback on retry button click", () => {
    const onRetry = jest.fn();

    render(<InstitutionalUnavailableView onRetry={onRetry} />);

    fireEvent.click(screen.getByRole("button", { name: /Reintentar/i }));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });
});
