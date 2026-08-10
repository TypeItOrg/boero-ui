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
    const onDraftChange = jest.fn();

    render(<DatePicker onChange={onChange} onDraftChange={onDraftChange} />);

    const input = screen.getByRole("textbox");
    await user.type(input, "31022003");

    expect(input).toHaveValue("31/02/2003");
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(onChange).not.toHaveBeenCalledWith(expect.any(Date));
    expect(onDraftChange).toHaveBeenLastCalledWith("31/02/2003");
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

  it("supports required academic dates without imposing a past-date maximum", async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();

    render(<DatePicker required autoComplete="off" onChange={onChange} />);

    const input = screen.getByRole("textbox");
    await user.type(input, "01012035");

    expect(input).toBeRequired();
    expect(input).toHaveValue("01/01/2035");
    expect(onChange).toHaveBeenLastCalledWith(new Date(2035, 0, 1));
  });

  it("clears a selected date", async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();
    const onDraftChange = jest.fn();

    render(<DatePicker value={new Date(2035, 0, 1)} onChange={onChange} onDraftChange={onDraftChange} />);

    await user.click(screen.getByRole("button", { name: "Limpiar fecha" }));

    expect(onDraftChange).toHaveBeenLastCalledWith("");
    expect(onChange).toHaveBeenLastCalledWith(undefined);
  });

  it("disables calendar days before the contextual minimum without blocking manual range validation", async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();

    render(<DatePicker calendarMinDate={new Date(2035, 6, 24)} onChange={onChange} />);

    await user.click(screen.getByRole("button", { name: "Abrir calendario" }));

    const previousDay = document.querySelector<HTMLElement>('[role="gridcell"][data-day="2035-07-23"] button');
    const minimumDay = document.querySelector<HTMLElement>('[role="gridcell"][data-day="2035-07-24"] button');

    expect(previousDay).toBeDisabled();
    expect(minimumDay).toBeEnabled();

    await user.click(screen.getByRole("textbox"));
    await user.type(screen.getByRole("textbox"), "23072035");

    expect(onChange).toHaveBeenLastCalledWith(new Date(2035, 6, 23));
  });

  it("disables calendar days outside the input range", async () => {
    const user = userEvent.setup();

    render(
      <DatePicker value={new Date(2035, 6, 25)} minDate={new Date(2035, 6, 24)} maxDate={new Date(2035, 6, 26)} />,
    );

    await user.click(screen.getByRole("button", { name: "Abrir calendario" }));

    const dayBeforeRange = document.querySelector<HTMLElement>('[role="gridcell"][data-day="2035-07-23"] button');
    const firstAllowedDay = document.querySelector<HTMLElement>('[role="gridcell"][data-day="2035-07-24"] button');
    const lastAllowedDay = document.querySelector<HTMLElement>('[role="gridcell"][data-day="2035-07-26"] button');
    const dayAfterRange = document.querySelector<HTMLElement>('[role="gridcell"][data-day="2035-07-27"] button');

    expect(dayBeforeRange).toBeDisabled();
    expect(firstAllowedDay).toBeEnabled();
    expect(lastAllowedDay).toBeEnabled();
    expect(dayAfterRange).toBeDisabled();
  });
});
