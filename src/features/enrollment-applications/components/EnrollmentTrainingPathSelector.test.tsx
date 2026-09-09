import * as React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { EnrollmentTrainingPathSelector } from "./EnrollmentTrainingPathSelector";
import type { TrainingPath } from "@features/academic/types/training-path.types";

const MOCK_PATHS: TrainingPath[] = [
  {
    id: "tp-1",
    name: "Trayecto Guitarra Clásica",
    description: "Orientación en música académica",
    active: true,
    institutionId: "inst-1",
  },
  {
    id: "tp-2",
    name: "Trayecto Piano",
    description: "Orientación en teclas",
    active: true,
    institutionId: "inst-1",
  },
];

describe("EnrollmentTrainingPathSelector", () => {
  it("renders empty state when no training paths exist", () => {
    render(<EnrollmentTrainingPathSelector trainingPaths={[]} selectedTrainingPathId="" onSelectTrainingPath={jest.fn()} />);

    expect(screen.getByText(/no hay trayectos formativos específicos/i)).toBeInTheDocument();
  });

  it("renders training path options and calls callback on selection", async () => {
    const handleSelect = jest.fn();

    render(<EnrollmentTrainingPathSelector trainingPaths={MOCK_PATHS} selectedTrainingPathId="tp-1" onSelectTrainingPath={handleSelect} />);

    expect(screen.getByText("Trayecto Guitarra Clásica")).toBeInTheDocument();
    expect(screen.getByText("Trayecto Piano")).toBeInTheDocument();

    const pianoOption = screen.getByRole("radio", { name: /trayecto piano/i });
    await userEvent.click(pianoOption);

    expect(handleSelect).toHaveBeenCalledWith("tp-2");
  });

  it("displays validation error when provided", () => {
    render(
      <EnrollmentTrainingPathSelector
        trainingPaths={MOCK_PATHS}
        selectedTrainingPathId=""
        onSelectTrainingPath={jest.fn()}
        error="Debés seleccionar un trayecto"
      />,
    );

    expect(screen.getByText("Debés seleccionar un trayecto")).toBeInTheDocument();
  });
});
