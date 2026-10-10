import { render } from "@testing-library/react";

import { NavigationCardSkeleton } from "@common/components/navigation/navigation-card-skeleton";

describe("NavigationCardSkeleton", () => {
  it("hides decorative placeholders from assistive technology", () => {
    const { container } = render(<NavigationCardSkeleton />);
    const card = container.firstChild as HTMLElement;

    expect(card).toHaveAttribute("aria-hidden", "true");
  });
});
