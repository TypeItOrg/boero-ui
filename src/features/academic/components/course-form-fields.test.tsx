import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { CourseFields } from "@features/academic/components/course-form-fields";
import { AcademicScope } from "@features/academic/utils/academic-scope.util";

import { renderWithQueryClient } from "@/../test/utils/render-with-query-client";

jest.mock("@tanstack/react-virtual", () => ({
  useVirtualizer: jest.requireActual("@/../test/utils/mock-virtualizer").mockVirtualizer,
}));

describe("course form dependencies", () => {
  afterEach(() => jest.restoreAllMocks());

  it("clears dependent payload values when changing plan and derives them from the newly chosen space", async () => {
    const user = userEvent.setup();
    jest.spyOn(global, "fetch").mockImplementation(async (input) =>
      Response.json({
        items: String(input).includes("options/study-plans")
          ? [{ id: "plan-b", name: "Plan nuevo" }]
          : [{ id: "space-b", studyPlanSpaceId: "plan-space-b", name: "Ensamble", type: "SUBJECT", format: "GRUPAL", instrumental: false }],
        page: 0,
        totalPages: 1,
      }),
    );
    renderWithQueryClient(
      <form aria-label="curso">
        <CourseFields
          institutionId="institution-a"
          scope={AcademicScope.INSTITUTIONAL}
          initialValues={{
            studyPlanId: "plan-a",
            studyPlanName: "Plan anterior",
            studyPlanSpaceId: "plan-space-a",
            academicSpaceId: "space-a",
            academicSpaceName: "Instrumento",
            academicSpaceFormat: "INDIVIDUAL",
            academicSpaceInstrumental: true,
            instrumentId: "guitar",
            instrumentName: "Guitarra",
          }}
        />
      </form>,
    );
    const form = screen.getByRole("form", { name: "curso" }) as HTMLFormElement;
    expect(new FormData(form).get("instrumentId")).toBe("guitar");
    await user.click(screen.getByRole("combobox", { name: "Plan de estudio" }));
    await user.click(await screen.findByRole("option", { name: "Plan nuevo" }));

    const changed = new FormData(form);
    expect(changed.get("studyPlanId")).toBe("plan-b");
    expect(changed.get("studyPlanSpaceId")).toBe("");
    expect(changed.get("academicSpaceId")).toBe("");
    expect(changed.get("instrumentId")).toBe("");
    expect(changed.get("format")).toBe("");
    expect(screen.queryByRole("combobox", { name: "Instrumento" })).not.toBeInTheDocument();
    expect(screen.getByRole("combobox", { name: "Espacio académico" })).toHaveTextContent("Seleccionar espacio");

    await user.click(screen.getByRole("combobox", { name: "Espacio académico" }));
    await user.click(await screen.findByRole("option", { name: /Ensamble/ }));

    const selected = new FormData(form);
    expect(selected.get("studyPlanSpaceId")).toBe("plan-space-b");
    expect(selected.get("academicSpaceId")).toBe("space-b");
    expect(selected.get("format")).toBe("GRUPAL");
    expect(selected.get("instrumentId")).toBe("");
    expect(screen.getByRole("combobox", { name: "Espacio académico" })).toHaveTextContent("Ensamble");
  });

  it("resets the course draft when moving to a different institution", () => {
    const { rerender } = renderWithQueryClient(
      <form aria-label="curso">
        <CourseFields
          institutionId="institution-a"
          scope={AcademicScope.ADMIN}
          initialValues={{ studyPlanId: "plan-a", studyPlanSpaceId: "space-a", instrumentId: "instrument-a" }}
        />
      </form>,
    );

    rerender(
      <form aria-label="curso">
        <CourseFields institutionId="institution-b" scope={AcademicScope.ADMIN} />
      </form>,
    );

    const form = screen.getByRole("form", { name: "curso" }) as HTMLFormElement;
    expect(new FormData(form).get("studyPlanId")).toBe("");
    expect(new FormData(form).get("studyPlanSpaceId")).toBe("");
    expect(new FormData(form).get("instrumentId")).toBe("");
    expect(screen.getByRole("combobox", { name: "Plan de estudio" })).toHaveTextContent("Seleccionar plan");
  });
});
