import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { EnrollmentStartSelector } from "@features/enrollment-applications/components/EnrollmentStartSelector";

const OPTIONS = [
  { id: "path-1", name: "CAV Básico", trainingPathName: "CAV Básico" },
  { id: "path-2", name: "Canto", trainingPathName: "Instrumento" },
];

describe("EnrollmentStartSelector", () => {
  it("starts with the default or explicitly chosen path and locks selection while starting", async () => {
    const user = userEvent.setup();
    const onStart = jest.fn();
    const { rerender } = render(<EnrollmentStartSelector studyPlans={OPTIONS} onStart={onStart} />);
    expect(screen.getByRole("radio", { name: "CAV Básico" })).toBeChecked();

    await user.click(screen.getByRole("button", { name: "Comenzar inscripción" }));
    expect(onStart).toHaveBeenNthCalledWith(1, { trainingPathId: "path-1" });
    await user.click(screen.getByRole("radio", { name: "Canto · Instrumento" }));
    await user.click(screen.getByRole("button", { name: "Comenzar inscripción" }));
    expect(onStart).toHaveBeenNthCalledWith(2, { trainingPathId: "path-2" });

    rerender(<EnrollmentStartSelector studyPlans={OPTIONS} onStart={onStart} isStarting />);
    expect(screen.getByRole("button", { name: "Iniciando…" })).toBeDisabled();

    for (const option of screen.getAllByRole("radio")) {
      expect(option).toBeDisabled();
    }

    await user.click(screen.getByRole("radio", { name: "CAV Básico" }));
    expect(screen.getByRole("radio", { name: "Canto · Instrumento" })).toBeChecked();
    expect(onStart).toHaveBeenCalledTimes(2);
  });

  it("cannot start without an available path", async () => {
    const user = userEvent.setup();
    const onStart = jest.fn();
    render(<EnrollmentStartSelector studyPlans={[]} onStart={onStart} />);

    expect(screen.getByText("No hay trayectos disponibles")).toBeVisible();
    const start = screen.getByRole("button", { name: "Comenzar inscripción" });
    expect(start).toBeDisabled();
    await user.click(start);
    expect(onStart).not.toHaveBeenCalled();
  });

  it("uses an available path when pagination removes the previous selection", async () => {
    const user = userEvent.setup();
    const onStart = jest.fn();
    const { rerender } = render(<EnrollmentStartSelector studyPlans={OPTIONS} onStart={onStart} />);
    await user.click(screen.getByRole("radio", { name: "Canto · Instrumento" }));

    rerender(<EnrollmentStartSelector studyPlans={[OPTIONS[0]]} onStart={onStart} />);
    expect(screen.getByRole("radio", { name: "CAV Básico" })).toBeChecked();
    await user.click(screen.getByRole("button", { name: "Comenzar inscripción" }));
    expect(onStart).toHaveBeenCalledWith({ trainingPathId: "path-1" });
  });
});
