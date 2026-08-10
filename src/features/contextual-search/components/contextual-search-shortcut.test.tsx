import { render, screen } from "@testing-library/react";

import { ContextualSearchShortcut } from "@features/contextual-search/components/contextual-search-shortcut";

describe("ContextualSearchShortcut", () => {
  it("shows the command glyph on mac", () => {
    render(<ContextualSearchShortcut platform="mac" />);
    expect(screen.getByText("\u2318 K")).toBeInTheDocument();
  });

  it("shows the control shortcut on windows", () => {
    render(<ContextualSearchShortcut platform="windows" />);
    expect(screen.getByText("Ctrl K")).toBeInTheDocument();
  });
});
