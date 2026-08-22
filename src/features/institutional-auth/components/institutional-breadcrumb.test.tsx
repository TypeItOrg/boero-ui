import { render, screen } from "@testing-library/react";
import { usePathname } from "next/navigation";

import { InstitutionalBreadcrumb } from "@features/institutional-auth/components/institutional-breadcrumb";

jest.mock("next/navigation", () => ({
  usePathname: jest.fn(),
}));

describe("InstitutionalBreadcrumb", () => {
  it("renders academic resources directly below Inicio", () => {
    jest.mocked(usePathname).mockReturnValue("/study-plans");

    render(<InstitutionalBreadcrumb />);

    expect(screen.getByRole("link", { name: "Inicio" })).toHaveAttribute("href", "/");
    expect(screen.getByText("Planes de estudio")).toBeInTheDocument();
    expect(screen.queryByText("Académico")).not.toBeInTheDocument();
  });

  it("keeps resource links addressable when deeper segments are present", () => {
    jest.mocked(usePathname).mockReturnValue("/study-plans/plan-id");

    render(<InstitutionalBreadcrumb segmentLabels={{ "plan-id": "Plan 2026" }} />);

    expect(screen.getByRole("link", { name: "Planes de estudio" })).toHaveAttribute("href", "/study-plans");
    expect(screen.getByText("Plan 2026")).toBeInTheDocument();
  });

  it("uses an overridden href for a resource identifier", () => {
    jest.mocked(usePathname).mockReturnValue("/academic-years/2026/edit");

    render(<InstitutionalBreadcrumb segmentHrefs={{ "2026": "/academic-years" }} segmentLabels={{ "2026": "2026" }} />);

    expect(screen.getByRole("link", { name: "2026" })).toHaveAttribute("href", "/academic-years");
  });

  it("labels account pages below Cuenta", () => {
    jest.mocked(usePathname).mockReturnValue("/account/password");

    render(<InstitutionalBreadcrumb />);

    expect(screen.getByRole("link", { name: "Inicio" })).toHaveAttribute("href", "/");
    expect(screen.getByRole("link", { name: "Cuenta" })).toHaveAttribute("href", "/account");
    expect(screen.getByText("Contraseña")).toBeInTheDocument();
  });

  it("omits non-navigable academic level segments", () => {
    jest.mocked(usePathname).mockReturnValue("/study-plans/plan-id/academic-levels/level-id/edit");

    render(
      <InstitutionalBreadcrumb hiddenSegments={["academic-levels", "level-id"]} segmentLabels={{ "plan-id": "Plan 2026", edit: "Editar Nivel 1" }} />,
    );

    expect(screen.getByRole("link", { name: "Plan 2026" })).toHaveAttribute("href", "/study-plans/plan-id");
    expect(screen.getByText("Editar Nivel 1")).toBeInTheDocument();
    expect(screen.queryByText("Niveles")).not.toBeInTheDocument();
  });
});
