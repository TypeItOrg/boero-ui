import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { DatePicker } from "@common/components/ui/date-picker";

describe("DatePicker", () => {
  it("allows entering a valid date manually", async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();

    render(<DatePicker id="birth-date" onChange={onChange} />);

    const input = screen.getByRole("textbox");
    await user.type(input, "03042003");

    expect(input).toHaveValue("03/04/2003");
    expect(onChange).toHaveBeenLastCalledWith(new Date(2003, 3, 3));
  });

  it("does not emit a date when the entered value is invalid", async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();

    render(<DatePicker onChange={onChange} />);

    const input = screen.getByRole("textbox");
    await user.type(input, "31022003");

    expect(input).toHaveValue("31/02/2003");
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(onChange).not.toHaveBeenCalledWith(expect.any(Date));
  });

  it("rejects manually entered dates after the maximum date", async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();

    render(<DatePicker maxDate={new Date(2003, 3, 2)} onChange={onChange} />);

    const input = screen.getByRole("textbox");
    await user.type(input, "03042003");

    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(onChange).not.toHaveBeenCalledWith(expect.any(Date));
  });
});
