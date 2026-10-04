import { courseEnrollmentGradeSchema } from "@features/course-enrollments/schemas/course-enrollment-grade.schema";

describe("courseEnrollmentGradeSchema", () => {
  it("accepts valid evaluation and grade", () => {
    const result = courseEnrollmentGradeSchema.safeParse({ evaluation: "Parcial 1", value: "7,50" });

    expect(result.success).toBe(true);
  });

  it("rejects empty evaluation", () => {
    const result = courseEnrollmentGradeSchema.safeParse({ evaluation: "   ", value: 7 });

    expect(result.success).toBe(false);
  });

  it("rejects out of range grades", () => {
    expect(courseEnrollmentGradeSchema.safeParse({ evaluation: "Parcial 1", value: 0 }).success).toBe(false);
    expect(courseEnrollmentGradeSchema.safeParse({ evaluation: "Parcial 1", value: 10.01 }).success).toBe(false);
  });

  it("rejects more than two decimals", () => {
    expect(courseEnrollmentGradeSchema.safeParse({ evaluation: "Parcial 1", value: 7.555 }).success).toBe(false);
  });
});
