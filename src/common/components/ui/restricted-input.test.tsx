import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { NumericInput, PhoneInput } from "@common/components/ui/restricted-input";

describe("restricted inputs", () => {
  it("keeps only digits in numeric inputs", async () => {
    const user = userEvent.setup();
    render(<NumericInput aria-label="Documento" />);

    const input = screen.getByRole("textbox", { name: "Documento" });
    await user.type(input, "12e3+4-5");

    expect(input).toHaveValue("12345");
    expect(input).toHaveAttribute("inputmode", "numeric");
  });

  it("keeps only digits and hyphens in phone inputs", async () => {
    const user = userEvent.setup();
    render(<PhoneInput aria-label="Teléfono" />);

    const input = screen.getByRole("textbox", { name: "Teléfono" });
    await user.type(input, "+54 (353)-461 9146");

    expect(input).toHaveValue("54353-4619146");
    expect(input).toHaveAttribute("inputmode", "tel");
  });
});
