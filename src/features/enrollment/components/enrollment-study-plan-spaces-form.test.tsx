jest.mock("@features/enrollment/actions/save-enrollment-application-study-plan-spaces.action", () => ({
  saveEnrollmentApplicationStudyPlanSpacesAction: jest.fn(),
}));

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { EnrollmentStudyPlanSpacesForm } from "@features/enrollment/components/enrollment-study-plan-spaces-form";

describe("EnrollmentStudyPlanSpacesForm", () => {
  const studyPlanSpaces = [
    {
      id: "019183ab-45bc-7000-8000-000000000101",
      studyPlanId: "study-plan-1",
      academicSpaceId: "academic-space-1",
      academicSpaceName: "Matematica I",
      academicLevelId: "level-1",
      academicLevelName: "Primer ano",
      requirementType: "REQUIRED",
      displayOrder: 1,
      approvalMode: "PROMOTION",
    },
    {
      id: "019183ab-45bc-7000-8000-000000000102",
      studyPlanId: "study-plan-1",
      academicSpaceId: "academic-space-2",
      academicSpaceName: "Historia",
      academicLevelId: null,
      academicLevelName: null,
      requirementType: "OPTIONAL",
      displayOrder: 2,
      approvalMode: "FINAL_EXAM",
    },
  ] as const;

  it("initializes from the current draft selection and toggles spaces", async () => {
    const user = userEvent.setup();

    const { container } = render(
      <EnrollmentStudyPlanSpacesForm
        applicationId="application-1"
        applicationEditable
        currentData={{ academicSpaceSelection: { studyPlanSpaceIds: [studyPlanSpaces[0].id] } }}
        studyPlanSpaces={studyPlanSpaces}
        returnTo="/"
        studyPlanName="Profesorado"
        academicYearLabel="2026"
      />,
    );

    const firstSpace = screen.getByRole("checkbox", { name: /Matematica I/i });
    const secondSpace = screen.getByRole("checkbox", { name: /Historia/i });

    expect(firstSpace).toHaveAttribute("aria-checked", "true");
    expect(secondSpace).toHaveAttribute("aria-checked", "false");

    await user.click(secondSpace);
    expect(secondSpace).toHaveAttribute("aria-checked", "true");
    expect(container.querySelectorAll('input[name="studyPlanSpaceIds"]')).toHaveLength(2);

    await user.click(firstSpace);
    expect(firstSpace).toHaveAttribute("aria-checked", "false");
    expect(container.querySelectorAll('input[name="studyPlanSpaceIds"]')).toHaveLength(1);
  });

  it("disables selection when the application is not editable", () => {
    render(
      <EnrollmentStudyPlanSpacesForm
        applicationId="application-1"
        applicationEditable={false}
        currentData={{}}
        studyPlanSpaces={studyPlanSpaces}
        returnTo="/"
        studyPlanName="Profesorado"
        academicYearLabel="2026"
      />,
    );

    expect(screen.getByRole("checkbox", { name: /Matematica I/i })).toBeDisabled();
    expect(screen.getByText("Solicitud no editable")).toBeInTheDocument();
  });

  it("renders the empty state when no study plan spaces are available", () => {
    render(
      <EnrollmentStudyPlanSpacesForm
        applicationId="application-1"
        applicationEditable
        currentData={{}}
        studyPlanSpaces={[]}
        returnTo="/"
        studyPlanName="Profesorado"
        academicYearLabel="2026"
      />,
    );

    expect(screen.getByText("No hay espacios disponibles")).toBeInTheDocument();
    expect(screen.getByText(/no seleccionaste espacios academicos/i)).toBeInTheDocument();
  });
});
