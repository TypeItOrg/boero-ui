import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { ErrorBoundary } from "@common/components/error-boundary";

describe("ErrorBoundary", () => {
  it("renders its fallback and recovers after reset", async () => {
    let shouldThrow = true;
    const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => undefined);

    function BrokenChild(): React.ReactElement {
      if (shouldThrow) throw new Error("boom");

      return <p>Contenido recuperado</p>;
    }

    render(
      <ErrorBoundary
        fallback={(reset) => (
          <button
            type="button"
            onClick={() => {
              shouldThrow = false;
              reset();
            }}
          >
            Reintentar
          </button>
        )}
      >
        <BrokenChild />
      </ErrorBoundary>,
    );

    expect(screen.getByRole("button", { name: "Reintentar" })).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "Reintentar" }));

    expect(screen.getByText("Contenido recuperado")).toBeInTheDocument();
    consoleErrorSpy.mockRestore();
  });
});
