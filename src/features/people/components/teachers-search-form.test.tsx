import { render, screen } from "@testing-library/react";

import { TeachersSearchForm } from "@features/people/components/teachers-search-form";

describe("TeachersSearchForm", () => {
  it("renders the teacher search without a role filter", () => {
    render(<TeachersSearchForm search="ana" size={10} />);

    expect(screen.getByPlaceholderText("Buscar por nombre, apellido o documento...")).toHaveValue("ana");
    expect(screen.queryByText("Rol")).not.toBeInTheDocument();
  });
});
