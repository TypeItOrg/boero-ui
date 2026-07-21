import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { InstitutionForm } from "@features/institutions/components/institution-form";

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: jest.fn() }),
}));

jest.mock("@features/locations/components/location-picker", () => ({
  LocationPicker: () => <div data-testid="location-picker" />,
}));

jest.mock("../actions/create-institution.action", () => ({
  createInstitutionAction: jest.fn(),
}));

jest.mock("../actions/update-institution.action", () => ({
  updateInstitutionAction: jest.fn(),
}));

describe("InstitutionForm slug generation", () => {
  it("generates the slug from the institution name in create mode", async () => {
    const user = userEvent.setup();
    render(<InstitutionForm mode="create" />);

    await user.type(screen.getByRole("textbox", { name: /^Nombre/ }), "Conservatorio Superior de Música");

    expect(screen.getByRole("textbox", { name: /^Slug/ })).toHaveValue("conservatorio-superior-de-musica");
  });

  it("preserves a manually edited slug when the name changes", async () => {
    const user = userEvent.setup();
    render(<InstitutionForm mode="create" />);
    const nameInput = screen.getByRole("textbox", { name: /^Nombre/ });
    const slugInput = screen.getByRole("textbox", { name: /^Slug/ });

    await user.type(nameInput, "Escuela de Música");
    await user.clear(slugInput);
    await user.type(slugInput, "slug-personalizado");
    await user.clear(nameInput);
    await user.type(nameInput, "Nuevo nombre");

    expect(slugInput).toHaveValue("slug-personalizado");
  });
});
