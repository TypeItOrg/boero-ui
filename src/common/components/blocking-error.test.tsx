import { render, screen } from "@testing-library/react";

import { BlockingError } from "@common/components/blocking-error";

describe("BlockingError", () => {
  it("links to the institutional home by default", () => {
    render(<BlockingError retry={jest.fn()} />);

    expect(screen.getByRole("link", { name: "Ir al inicio" })).toHaveAttribute("href", "/");
  });

  it("accepts a platform-specific home", () => {
    render(<BlockingError retry={jest.fn()} homeHref="/admin" />);

    expect(screen.getByRole("link", { name: "Ir al inicio" })).toHaveAttribute("href", "/admin");
  });
});
