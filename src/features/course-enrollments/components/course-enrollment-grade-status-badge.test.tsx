import { render, screen } from "@testing-library/react";

import { CourseEnrollmentGradeStatusBadge } from "@features/course-enrollments/components/course-enrollment-grade-status-badge";

describe("CourseEnrollmentGradeStatusBadge", () => {
  it("renders draft status", () => {
    render(<CourseEnrollmentGradeStatusBadge status="DRAFT" />);

    expect(screen.getByText("Borrador")).toBeInTheDocument();
  });

  it("renders published status", () => {
    render(<CourseEnrollmentGradeStatusBadge status="PUBLISHED" />);

    expect(screen.getByText("Publicado")).toBeInTheDocument();
  });

  it("renders pending changes status", () => {
    render(<CourseEnrollmentGradeStatusBadge status="PENDING_CHANGES" />);

    expect(screen.getByText("Cambios sin publicar")).toBeInTheDocument();
  });

  it("renders pending deletion status", () => {
    render(<CourseEnrollmentGradeStatusBadge status="PENDING_DELETION" />);

    expect(screen.getByText("Pendiente de eliminación")).toBeInTheDocument();
  });
});
