import * as React from "react";
import { render, screen } from "@testing-library/react";
import { EnrollmentStatusBadge } from "./EnrollmentStatusBadge";

describe("EnrollmentStatusBadge", () => {
  it.each([
    ["DRAFT", "Borrador"],
    ["SUBMITTED", "Enviada"],
    ["APPROVED", "Aprobada"],
    ["REJECTED", "Rechazada"],
    ["CANCELLED", "Cancelada"],
  ] as const)("renders badge for %s status with label %s", (status, label) => {
    render(<EnrollmentStatusBadge status={status} />);
    expect(screen.getByText(label)).toBeInTheDocument();
  });
});
