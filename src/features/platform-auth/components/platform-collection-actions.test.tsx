import { render, screen } from "@testing-library/react";

import { PlatformCollectionActions } from "@features/platform-auth/components/platform-collection-actions";

describe("PlatformCollectionActions", () => {
  it("returns null without children", () => {
    const { container } = render(<PlatformCollectionActions>{undefined}</PlatformCollectionActions>);

    expect(container.firstChild).toBeNull();
  });

  it("stacks full-width actions with spacing on mobile and rows them on desktop", () => {
    render(
      <PlatformCollectionActions>
        <button type="button">Filtros avanzados</button>
        <button type="button">Nuevo curso</button>
      </PlatformCollectionActions>,
    );

    const actions = screen.getByRole("button", { name: "Nuevo curso" }).parentElement;
    expect(actions).toHaveClass("flex-col", "gap-2", "[&>*]:w-full", "sm:flex-row", "sm:justify-end", "sm:[&>*]:w-auto");
  });

  it("allows overriding alignment classes via className", () => {
    render(
      <PlatformCollectionActions className="sm:justify-between">
        <button type="button">Nuevo curso</button>
        <button type="button">Filtros avanzados</button>
      </PlatformCollectionActions>,
    );

    const actions = screen.getByRole("button", { name: "Nuevo curso" }).parentElement;
    expect(actions).toHaveClass("sm:justify-between");
    expect(actions).not.toHaveClass("sm:justify-end");
  });
});
