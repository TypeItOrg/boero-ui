import { toFormControlValue, toOptionalFormString } from "@common/utils/form-value.util";

describe("form values", () => {
  it.each([
    [undefined, ""],
    [null, ""],
    [true, "true"],
    [false, "false"],
    [0, 0],
    ["value", "value"],
  ])("normalizes %p for a form control", (input, expected) => {
    expect(toFormControlValue(input)).toBe(expected);
  });

  it.each([
    [undefined, undefined],
    [null, undefined],
    ["", undefined],
    [false, "false"],
    [0, "0"],
    ["value", "value"],
  ])("stringifies optional value %p", (input, expected) => {
    expect(toOptionalFormString(input)).toBe(expected);
  });
});
