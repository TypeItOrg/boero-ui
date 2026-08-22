import { render, screen } from "@testing-library/react";
import { usePathname } from "next/navigation";

import { InstitutionalAccountTabs } from "@features/institutional-auth/components/institutional-account-tabs";

jest.mock("next/navigation", () => ({
  usePathname: jest.fn(),
}));

describe("InstitutionalAccountTabs", () => {
  it.each([
    ["/account", "Perfil"],
    ["/account/edit", "Perfil"],
    ["/account/password", "Contraseña"],
    ["/account/sessions", "Sesiones"],
  ])("marks %s as the %s tab", (pathname, expectedTitle) => {
    jest.mocked(usePathname).mockReturnValue(pathname);

    render(<InstitutionalAccountTabs />);

    expect(screen.getByRole("link", { name: expectedTitle })).toHaveAttribute("aria-current", "page");
  });

  it("renders every account section as a link", () => {
    jest.mocked(usePathname).mockReturnValue("/account");

    render(<InstitutionalAccountTabs />);

    expect(screen.getByRole("link", { name: "Perfil" })).toHaveAttribute("href", "/account");
    expect(screen.getByRole("link", { name: "Contraseña" })).toHaveAttribute("href", "/account/password");
    expect(screen.getByRole("link", { name: "Sesiones" })).toHaveAttribute("href", "/account/sessions");
  });
});
