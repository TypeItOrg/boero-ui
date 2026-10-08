import { act, render, screen } from "@testing-library/react";
import { toast } from "sonner";

import { Providers } from "@app/providers";

describe("application providers", () => {
  const originalMatchMedia = window.matchMedia;

  beforeEach(() => {
    window.matchMedia = jest.fn((query) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(() => false),
    }));
  });

  afterEach(() => {
    window.matchMedia = originalMatchMedia;
  });

  it("displays feedback emitted by actions in the application notification host", async () => {
    render(
      <Providers>
        <main>Aplicación</main>
      </Providers>,
    );

    act(() => {
      toast.error("No se pudo reactivar la institución.", { duration: Infinity });
    });

    expect(await screen.findByText("No se pudo reactivar la institución.")).toBeVisible();
    expect(screen.getByRole("main")).toHaveTextContent("Aplicación");
    act(() => {
      toast.dismiss();
    });
  });
});
