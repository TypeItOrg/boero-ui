import { formatGradeValue } from "@features/course-enrollments/utils/course-enrollment-grade-format.util";

describe("formatGradeValue", () => {
  it("formats whole numbers without decimals", () => {
    expect(formatGradeValue(7)).toBe("7");
  });

  it("formats decimals with Spanish comma", () => {
    expect(formatGradeValue(7.5)).toBe("7,5");
    expect(formatGradeValue(8.25)).toBe("8,25");
  });

  it("accepts string input", () => {
    expect(formatGradeValue("7.50")).toBe("7,5");
  });
});
