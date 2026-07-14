import { fireEvent, render, screen } from "@testing-library/react";
import { useLinkStatus } from "next/link";

import { Button } from "@common/components/ui/button";
import { NavigationLink } from "@common/components/ui/navigation-link";

jest.mock("next/link", () => {
  const actual = jest.requireActual("next/link");

  return {
    ...actual,
    useLinkStatus: jest.fn(),
  };
});

const useLinkStatusMock = jest.mocked(useLinkStatus);

describe("NavigationLink", () => {
  beforeEach(() => {
    useLinkStatusMock.mockReturnValue({ pending: false });
  });

  it("renders a regular Next.js link without announcing navigation", () => {
    render(<NavigationLink href="/platform/people">Usuarios</NavigationLink>);

    expect(screen.getByRole("link", { name: "Usuarios" })).toHaveAttribute("href", "/platform/people");
    expect(screen.getByRole("status")).toBeEmptyDOMElement();
    expect(document.querySelector("[data-navigation-pending='false']")).toBeInTheDocument();
  });

  it("shows only an absolute spinner while navigation is pending", () => {
    useLinkStatusMock.mockReturnValue({ pending: true });

    render(
      <NavigationLink href="/platform/people/new" pendingLabel="Abriendo nuevo usuario">
        Nuevo usuario
      </NavigationLink>,
    );

    expect(screen.getByRole("status")).toHaveTextContent("Abriendo nuevo usuario");
    expect(document.querySelector("[data-navigation-pending='true']")).toHaveClass("absolute", "inset-0");
    expect(screen.getByText("Nuevo usuario")).toHaveClass("invisible");
  });

  it("keeps pulse feedback free of spinner markup", () => {
    useLinkStatusMock.mockReturnValue({ pending: true });

    render(
      <NavigationLink href="/platform" pendingVariant="pulse">
        Inicio
      </NavigationLink>,
    );

    expect(document.querySelector("[data-pending-variant='pulse']")).toBeInTheDocument();
    expect(document.querySelector("[data-pending-variant='pulse'] svg")).not.toBeInTheDocument();
  });

  it("preserves link behavior when composed through Button asChild", () => {
    render(
      <Button asChild size="lg">
        <NavigationLink href="/platform/accounts/new">Nueva cuenta</NavigationLink>
      </Button>,
    );

    const link = screen.getByRole("link", { name: "Nueva cuenta" });

    expect(link).toHaveAttribute("data-slot", "button");
    expect(link).toHaveAttribute("data-size", "lg");
  });

  it("prevents navigation when disabled through Button asChild", () => {
    const onClick = jest.fn();

    render(
      <Button asChild disabled>
        <NavigationLink href="/platform/accounts" onClick={onClick}>
          Cancelar
        </NavigationLink>
      </Button>,
    );

    const link = screen.getByRole("link", { name: "Cancelar" });

    fireEvent.click(link);

    expect(link).toHaveAttribute("aria-disabled", "true");
    expect(link).toHaveAttribute("tabindex", "-1");
    expect(onClick).not.toHaveBeenCalled();
  });
});
