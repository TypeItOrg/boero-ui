import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { AcademicFormFields } from "@features/academic/components/academic-form-fields";
import { AcademicResource } from "@features/academic/types/academic-resource.types";
import { AcademicScope } from "@features/academic/utils/academic-scope.util";
import { getCurrentAcademicYear, getMaxAcademicYear } from "@features/academic/utils/academic-year.util";

jest.mock("@common/components/ui/year-select", () => ({
  YearSelect: ({
    id,
    maxYear,
    minYear,
    name,
    onValueChange,
    required,
    value,
  }: {
    id?: string;
    maxYear: number;
    minYear: number;
    name?: string;
    onValueChange?: (value: string) => void;
    required?: boolean;
    value?: string;
  }) => (
    <select id={id} name={name} required={required} value={value ?? ""} onChange={(event) => onValueChange?.(event.currentTarget.value)}>
      {Array.from({ length: maxYear - minYear + 1 }, (_, index) => maxYear - index).map((year) => (
        <option key={year} value={String(year)}>
          {year}
        </option>
      ))}
    </select>
  ),
}));

describe("AcademicFormFields", () => {
  it("keeps a contextual study-plan trayecto fixed while preserving its hidden value", () => {
    const trainingPathId = "2d9ec931-453c-4778-86a9-dc40a06d0247";

    render(
      <QueryClientProvider client={new QueryClient()}>
        <AcademicFormFields
          resource={AcademicResource.STUDY_PLAN}
          institutionId="05b84ac4-66aa-409f-a813-012d15b8cb9b"
          scope={AcademicScope.INSTITUTIONAL}
          trainingPathLocked
          initialValues={{ trainingPathId, trainingPathName: "CAVI" }}
        />
      </QueryClientProvider>,
    );

    expect(screen.getByRole("combobox", { name: "Trayecto formativo" })).toBeDisabled();
    expect(document.querySelector<HTMLInputElement>('input[name="trainingPathId"]')).toHaveValue(trainingPathId);
  });

  it("marks the academic year as required and uses the shared date pickers", () => {
    render(<AcademicFormFields resource={AcademicResource.ACADEMIC_YEAR} />);

    expect(screen.getByLabelText(/Año/)).toBeRequired();
    expect(screen.getByText("Año").parentElement).toHaveTextContent("Año*");
    expect(screen.getByLabelText("Fecha de inicio")).toHaveAttribute("type", "text");
    expect(screen.getByLabelText("Fecha de finalización")).toHaveAttribute("type", "text");
    expect(screen.getAllByPlaceholderText("dd/mm/aaaa")).toHaveLength(2);
    expect(screen.getByLabelText(/Año/).closest('[data-slot="field"]')).toHaveClass("sm:col-span-2");
  });

  it("marks every required study-plan-space field consistently", () => {
    render(<AcademicFormFields resource={AcademicResource.STUDY_PLAN_SPACE} />);

    expect(screen.getByText("Espacio académico").parentElement).toHaveTextContent("Espacio académico*");
    expect(screen.getByText("Nivel").parentElement).not.toHaveTextContent("*");
    expect(screen.getByText("Orden").parentElement).toHaveTextContent("Orden*");
    expect(screen.getByText("Carácter").parentElement).toHaveTextContent("Carácter*");
    expect(screen.getByText("Aprobación").parentElement).toHaveTextContent("Aprobación*");
  });

  it("offers the supported academic year range", async () => {
    const user = userEvent.setup();
    render(<AcademicFormFields resource={AcademicResource.ACADEMIC_YEAR} />);

    await user.click(screen.getByLabelText(/Año/));

    expect(screen.getByRole("option", { name: "2000" })).toBeVisible();
    expect(screen.getByRole("option", { name: String(getMaxAcademicYear()) })).toBeVisible();
    expect(screen.queryByRole("option", { name: "1999" })).not.toBeInTheDocument();
  });

  it("enables academic dates after selecting the year", async () => {
    const user = userEvent.setup();
    render(<AcademicFormFields resource={AcademicResource.ACADEMIC_YEAR} />);

    expect(screen.getByLabelText("Fecha de inicio")).toBeDisabled();
    expect(screen.getByLabelText("Fecha de finalización")).toBeDisabled();

    await user.selectOptions(screen.getByLabelText(/Año/), String(getCurrentAcademicYear()));

    expect(screen.getByLabelText("Fecha de inicio")).toBeEnabled();
    expect(screen.getByLabelText("Fecha de finalización")).toBeEnabled();
  });

  it("renders the initial academic year before interaction", () => {
    const year = getCurrentAcademicYear();
    render(<AcademicFormFields resource={AcademicResource.ACADEMIC_YEAR} initialValues={{ year }} />);

    expect(screen.getByLabelText(/Año/)).toHaveTextContent(String(year));
  });

  it("renders the academic year status selector while editing", () => {
    render(<AcademicFormFields resource={AcademicResource.ACADEMIC_YEAR} initialValues={{ status: "PLANNED" }} />);

    const statusSelect = screen.getByRole("combobox", { name: "Estado" });
    expect(statusSelect).toHaveTextContent("Planificado");
  });

  it("includes the original training-path status while editing", () => {
    const { container } = render(
      <form>
        <AcademicFormFields
          resource={AcademicResource.TRAINING_PATH}
          initialValues={{ id: "2d9ec931-453c-4778-86a9-dc40a06d0247", name: "CAVI", active: true }}
        />
      </form>,
    );

    expect(screen.getByRole("combobox", { name: "Estado" })).toHaveTextContent("Activo");
    expect(new FormData(container.querySelector("form")!).get("initialActive")).toBe("true");
  });

  it("renders instrument status while editing", () => {
    const { container } = render(
      <form>
        <AcademicFormFields
          resource={AcademicResource.INSTRUMENT}
          initialValues={{
            id: "2d9ec931-453c-4778-86a9-dc40a06d0247",
            name: "Piano",
            description: "Instrumento de teclas.",
            active: true,
          }}
        />
      </form>,
    );

    expect(screen.getByLabelText(/^Nombre/)).toHaveValue("Piano");
    expect(screen.getByLabelText("Descripción")).toHaveValue("Instrumento de teclas.");
    expect(screen.getByRole("combobox", { name: "Estado" })).toHaveTextContent("Activo");

    const formData = new FormData(container.querySelector("form")!);
    expect(formData.get("name")).toBe("Piano");
    expect(formData.get("description")).toBe("Instrumento de teclas.");
    expect(formData.get("active")).toBe("true");
    expect(formData.get("initialActive")).toBe("true");
  });

  it("renders the academic-space status selector while editing", () => {
    const { container } = render(
      <form>
        <AcademicFormFields
          resource={AcademicResource.ACADEMIC_SPACE}
          canChangeStatus
          initialValues={{
            id: "2d9ec931-453c-4778-86a9-dc40a06d0247",
            name: "Armonía",
            description: "Relaciones entre sonidos.",
            type: "SUBJECT",
            active: true,
          }}
        />
      </form>,
    );

    expect(screen.getByRole("combobox", { name: "Estado" })).toHaveTextContent("Activo");

    const formData = new FormData(container.querySelector("form")!);
    expect(formData.get("active")).toBe("true");
    expect(formData.get("initialActive")).toBe("true");
  });

  it("restricts academic dates to the selected year and the following year", async () => {
    const user = userEvent.setup();
    const year = getCurrentAcademicYear();
    render(<AcademicFormFields resource={AcademicResource.ACADEMIC_YEAR} initialValues={{ year }} />);

    const startDate = screen.getByLabelText("Fecha de inicio");
    const endDate = screen.getByLabelText("Fecha de finalización");

    await user.type(startDate, `0101${year - 1}`);
    await user.type(endDate, `0101${year + 2}`);

    expect(startDate).toHaveAttribute("aria-invalid", "true");
    expect(endDate).toHaveAttribute("aria-invalid", "true");
  });

  it("clears both dates when the academic year changes", async () => {
    const user = userEvent.setup();
    const initialYear = getMaxAcademicYear();
    const nextYear = initialYear - 2;
    render(<AcademicFormFields resource={AcademicResource.ACADEMIC_YEAR} initialValues={{ year: initialYear }} />);

    const startDate = screen.getByLabelText("Fecha de inicio");
    const endDate = screen.getByLabelText("Fecha de finalización");
    await user.type(startDate, `0101${initialYear}`);
    await user.type(endDate, `3112${initialYear}`);

    expect(startDate).toHaveValue(`01/01/${initialYear}`);
    expect(endDate).toHaveValue(`31/12/${initialYear}`);

    await user.selectOptions(screen.getByLabelText(/Año/), String(nextYear));

    expect(screen.getByLabelText("Fecha de inicio")).toHaveValue("");
    expect(screen.getByLabelText("Fecha de finalización")).toHaveValue("");
    expect(document.querySelector<HTMLInputElement>('input[name="startDate"]')).toHaveValue("");
    expect(document.querySelector<HTMLInputElement>('input[name="endDate"]')).toHaveValue("");
  });

  it("allows clearing each academic date independently", async () => {
    const user = userEvent.setup();
    const year = getCurrentAcademicYear();
    render(<AcademicFormFields resource={AcademicResource.ACADEMIC_YEAR} initialValues={{ year }} />);

    await user.type(screen.getByLabelText("Fecha de inicio"), `0101${year}`);
    await user.type(screen.getByLabelText("Fecha de finalización"), `3112${year}`);

    const clearButtons = screen.getAllByRole("button", { name: "Limpiar fecha" });
    expect(clearButtons).toHaveLength(2);

    await user.click(clearButtons[0]);

    expect(screen.getByLabelText("Fecha de inicio")).toHaveValue("");
    expect(screen.getByLabelText("Fecha de finalización")).toHaveValue(`31/12/${year}`);
  });

  it("keeps numeric restrictions for academic ordering fields", async () => {
    const user = userEvent.setup();
    render(<AcademicFormFields resource={AcademicResource.ACADEMIC_LEVEL} />);

    const order = screen.getByLabelText(/Orden/);
    await user.clear(order);
    await user.type(order, "2e+7");

    expect(order).toHaveValue("27");
    expect(order).toHaveAttribute("inputmode", "numeric");
  });

  it("places the academic level name and order in the same responsive row", () => {
    render(<AcademicFormFields resource={AcademicResource.ACADEMIC_LEVEL} />);

    const nameField = screen.getByLabelText(/Nombre/).closest('[data-slot="field"]');
    const orderField = screen.getByLabelText(/Orden/).closest('[data-slot="field"]');

    expect(nameField).not.toHaveClass("flex-[1_0_100%]");
    expect(orderField).toHaveClass("sm:max-w-48", "flex-none");
  });

  it("marks an end date before the start date as invalid", async () => {
    const user = userEvent.setup();
    const year = getCurrentAcademicYear();
    render(<AcademicFormFields resource={AcademicResource.ACADEMIC_YEAR} initialValues={{ year }} />);

    await user.type(screen.getByLabelText("Fecha de inicio"), `3107${year}`);
    await user.type(screen.getByLabelText("Fecha de finalización"), `2907${year}`);

    expect(screen.getByLabelText("Fecha de finalización")).toHaveAttribute("aria-invalid", "true");
    expect(document.querySelector<HTMLInputElement>('input[name="endDate"]')).toHaveValue(`29/07/${year}`);
    expect(screen.getByLabelText("Fecha de inicio").closest('[data-slot="field"]')).toHaveClass("self-start");
    expect(screen.getByLabelText("Fecha de finalización").closest('[data-slot="field"]')).toHaveClass("self-start");
  });

  it("preserves an invalid manual date so the project schema can report it", async () => {
    const user = userEvent.setup();
    const year = getCurrentAcademicYear();
    const { container } = render(<AcademicFormFields resource={AcademicResource.ACADEMIC_YEAR} initialValues={{ year }} />);

    await user.type(screen.getByLabelText("Fecha de inicio"), `3102${year}`);

    expect(container.querySelector<HTMLInputElement>('input[name="startDate"]')).toHaveValue(`31/02/${year}`);
  });
});
