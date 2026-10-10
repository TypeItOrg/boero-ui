import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { BlockingError } from "@common/components/blocking-error";

describe("BlockingError", () => {
  it("offers a retry and the institutional home when a page fails", async () => {
    const user = userEvent.setup();
    const retry = jest.fn();
    render(<BlockingError retry={retry} />);

    expect(screen.getByRole("link", { name: "Ir al inicio" })).toHaveAttribute("href", "/");
    await user.click(screen.getByRole("button", { name: "Reintentar" }));
    expect(retry).toHaveBeenCalledTimes(1);
  });
});
