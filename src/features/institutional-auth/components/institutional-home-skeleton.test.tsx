import { render, screen } from "@testing-library/react";

import { InstitutionalHomeSkeleton } from "./institutional-home-skeleton";

describe("InstitutionalHomeSkeleton", () => {
  it("renders with accessible status role and label", () => {
    render(<InstitutionalHomeSkeleton />);

    expect(screen.getByRole("status", { name: "Cargando portal institucional" })).toBeInTheDocument();
  });
});
