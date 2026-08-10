import { render, screen } from "@testing-library/react";

import { PlatformRouteSkeleton } from "@features/platform-auth/components/platform-route-skeleton";

describe("PlatformRouteSkeleton", () => {
  it("renders an accessible full-height route placeholder", () => {
    render(<PlatformRouteSkeleton />);

    expect(screen.getByRole("status", { name: "Cargando contenido" })).toHaveClass("h-full", "flex-1");
  });
});
