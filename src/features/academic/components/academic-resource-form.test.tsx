import { render, screen } from "@testing-library/react";

import { AcademicResourceForm } from "@features/academic/components/academic-resource-form";
import { AcademicResource } from "@features/academic/types/academic-resource.types";
import { AcademicScope } from "@features/academic/utils/academic-scope.util";

const INSTITUTION_ID = "05b84ac4-66aa-409f-a813-012d15b8cb9b";

describe("AcademicResourceForm", () => {
  it.each([
    { id: undefined, submitLabel: "Crear trayecto formativo" },
    { id: "2d9ec931-453c-4778-86a9-dc40a06d0247", submitLabel: "Guardar cambios" },
  ])("keeps $submitLabel actions at the bottom of the form", ({ id, submitLabel }) => {
    render(
      <AcademicResourceForm
        scope={AcademicScope.INSTITUTIONAL}
        institutionId={INSTITUTION_ID}
        resource={AcademicResource.TRAINING_PATH}
        id={id}
        returnTo="/training-paths"
      />,
    );

    const submitButton = screen.getByRole("button", { name: submitLabel });
    const form = submitButton.closest("form");
    const actions = submitButton.parentElement;

    expect(form).toHaveClass("h-full", "flex-1");
    expect(actions).toHaveClass("sticky", "bottom-0", "mt-auto");
  });
});
