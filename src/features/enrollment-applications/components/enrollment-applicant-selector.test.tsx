import { render, screen } from "@testing-library/react";

import { EnrollmentApplicantSelector } from "@features/enrollment-applications/components/enrollment-applicant-selector";

const DEPENDENTS = [
  { id: "dep-1", name: "Mateo Gonzalez" },
  { id: "dep-2", name: "Lucía Gonzalez" },
];

describe("EnrollmentApplicantSelector", () => {
  it("renders nothing when there are no dependents", () => {
    const { container } = render(<EnrollmentApplicantSelector dependents={[]} />);

    expect(container).toBeEmptyDOMElement();
  });

  it("links to the enrollment page for myself and for each dependent", () => {
    render(<EnrollmentApplicantSelector dependents={DEPENDENTS} />);

    expect(screen.getByRole("link", { name: "Inscribirme a mí mismo" })).toHaveAttribute("href", "/enrollment");
    expect(screen.getByRole("link", { name: "Mateo Gonzalez" })).toHaveAttribute("href", "/enrollment?dependentId=dep-1");
    expect(screen.getByRole("link", { name: "Lucía Gonzalez" })).toHaveAttribute("href", "/enrollment?dependentId=dep-2");
  });

  it("marks the selected dependent as current", () => {
    render(<EnrollmentApplicantSelector dependents={DEPENDENTS} selectedId="dep-2" />);

    expect(screen.getByRole("link", { name: "Lucía Gonzalez" })).toHaveAttribute("aria-current", "true");
    expect(screen.getByRole("link", { name: "Mateo Gonzalez" })).not.toHaveAttribute("aria-current");
    expect(screen.getByRole("link", { name: "Inscribirme a mí mismo" })).not.toHaveAttribute("aria-current");
  });

  it("marks myself as current when no dependent is selected", () => {
    render(<EnrollmentApplicantSelector dependents={DEPENDENTS} />);

    expect(screen.getByRole("link", { name: "Inscribirme a mí mismo" })).toHaveAttribute("aria-current", "true");
  });
});
