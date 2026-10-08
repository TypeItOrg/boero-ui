import { render, screen } from "@testing-library/react";

import { PlatformRouteSkeleton } from "@features/platform-auth/components/platform-route-skeleton";

describe("PlatformRouteSkeleton", () => {
  it("announces that route content is loading", () => {
    render(<PlatformRouteSkeleton />);

    expect(screen.getByRole("status", { name: "Cargando contenido" })).toBeInTheDocument();
  });
});
