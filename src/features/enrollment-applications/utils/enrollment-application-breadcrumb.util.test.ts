import { formatEnrollmentApplicationBreadcrumbLabel } from "@features/enrollment-applications/utils/enrollment-application-breadcrumb.util";

describe("formatEnrollmentApplicationBreadcrumbLabel", () => {
  it("identifies the application with applicant, path and year", () => {
    expect(formatEnrollmentApplicationBreadcrumbLabel({ trainingPathName: "CAV Básico", academicYearName: "2026" }, "Jane Doe")).toBe(
      "Solicitud de Jane Doe · CAV Básico 2026",
    );
  });

  it("falls back to the applicant when context is missing", () => {
    expect(formatEnrollmentApplicationBreadcrumbLabel({ trainingPathName: null }, "Jane Doe")).toBe("Solicitud de Jane Doe");
  });
});
