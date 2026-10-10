import { useState, type ReactElement } from "react";

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { PlatformDashboardErrorBoundary } from "@features/platform-dashboard/components/platform-dashboard-error";

describe("PlatformDashboardErrorBoundary", () => {
  it("retries rendering its children after a temporary error", async () => {
    const user = userEvent.setup();
    const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => undefined);

    function Harness(): ReactElement {
      const [shouldThrow, setShouldThrow] = useState(true);

      return (
        <>
          <button type="button" onClick={() => setShouldThrow(false)}>
            Preparar recuperación
          </button>
          <PlatformDashboardErrorBoundary>{shouldThrow ? <ThrowingChild /> : <p>Contenido recuperado</p>}</PlatformDashboardErrorBoundary>
        </>
      );
    }

    function ThrowingChild(): ReactElement {
      throw new Error("fallo temporal");
    }

    try {
      render(<Harness />);

      expect(screen.getByRole("link", { name: "Ir al inicio" })).toHaveAttribute("href", "/admin");
      await user.click(screen.getByRole("button", { name: "Preparar recuperación" }));
      await user.click(screen.getByRole("button", { name: "Reintentar" }));

      expect(screen.getByText("Contenido recuperado")).toBeInTheDocument();
    } finally {
      consoleErrorSpy.mockRestore();
    }
  });
});
