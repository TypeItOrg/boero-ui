import { render, screen } from "@testing-library/react";

import { TeachersTableEmptyState } from "@features/people/components/teachers-table-empty-state";

describe("TeachersTableEmptyState", () => {
  it("explains when a teacher search has no results", () => {
    render(<TeachersTableEmptyState isNavigating={false} search="guitarra" size={10} totalItems={0} />);

    expect(screen.getByText("No se encontraron docentes")).toBeInTheDocument();
    expect(screen.getByText("No encontramos docentes que coincidan con la búsqueda.")).toBeInTheDocument();
  });
});
