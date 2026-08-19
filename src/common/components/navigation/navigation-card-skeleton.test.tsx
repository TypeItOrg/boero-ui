import { render } from "@testing-library/react";

import { NavigationCardSkeleton } from "./navigation-card-skeleton";

describe("NavigationCardSkeleton", () => {
  it("renders with default compact styles and aria-hidden", () => {
    const { container } = render(<NavigationCardSkeleton />);
    const card = container.firstChild as HTMLElement;

    expect(card).toHaveAttribute("aria-hidden", "true");
    expect(card).toHaveClass("bg-background", "p-4");
  });

  it("renders with prominent styles when prominent prop is true", () => {
    const { container } = render(<NavigationCardSkeleton prominent className="custom-test-class" />);
    const card = container.firstChild as HTMLElement;

    expect(card).toHaveClass("bg-muted/25", "min-h-28", "custom-test-class");
  });
});
