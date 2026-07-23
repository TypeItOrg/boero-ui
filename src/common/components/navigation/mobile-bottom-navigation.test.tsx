import { render, screen } from "@testing-library/react";
import { BuildingIcon, HouseIcon, PlusIcon, UserLockIcon, UsersIcon } from "lucide-react";
import { usePathname } from "next/navigation";

import { MobileBottomNavigation } from "./mobile-bottom-navigation";

jest.mock("next/navigation", () => ({
  usePathname: jest.fn(),
}));

describe("MobileBottomNavigation", () => {
  it("places the primary destination in the center and keeps it as the only active item", () => {
    jest.mocked(usePathname).mockReturnValue("/admin/institutions/new");

    render(
      <MobileBottomNavigation
        items={[
          { title: "Inicio", url: "/admin", icon: HouseIcon, exact: true },
          { title: "Instituciones", url: "/admin/institutions", icon: BuildingIcon },
          { title: "Usuarios", url: "/admin/people", icon: UsersIcon },
          { title: "Roles", url: "/admin/roles", icon: UserLockIcon },
        ]}
        primaryItem={{
          title: "Crear",
          ariaLabel: "Crear institución",
          url: "/admin/institutions/new",
          icon: PlusIcon,
          exact: true,
        }}
      />,
    );

    expect(screen.getAllByRole("link").map((link) => link.textContent)).toEqual([
      "Inicio",
      "Instituciones",
      "Crear",
      "Usuarios",
      "Roles",
    ]);
    expect(screen.getByRole("link", { name: "Crear institución" })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("link", { name: "Instituciones" })).not.toHaveAttribute("aria-current");
  });
});
