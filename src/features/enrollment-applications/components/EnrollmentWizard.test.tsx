import * as React from "react";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { EnrollmentWizard } from "./EnrollmentWizard";
import type { EnrollmentApplicationResponse } from "../types/enrollment-application.types";

jest.mock("./EnrollmentStatusCard", () => ({
  EnrollmentStatusCard: ({ application }: { application: EnrollmentApplicationResponse }) => (
    <div data-testid="status-card">status:{application.status}</div>
  ),
}));

jest.mock("../actions/enrollment-application.actions", () => ({
  startOrGetEnrollmentApplicationAction: jest.fn(),
  updateEnrollmentDraftAction: jest.fn(),
  submitEnrollmentApplicationAction: jest.fn(),
  cancelEnrollmentApplicationAction: jest.fn(),
  fetchEnrollmentApplicationTrainingPathsAction: jest.fn(),
  fetchEnrollmentApplicationStudyPlanSpacesAction: jest.fn(),
}));

import {
  startOrGetEnrollmentApplicationAction,
  updateEnrollmentDraftAction,
  submitEnrollmentApplicationAction,
  cancelEnrollmentApplicationAction,
  fetchEnrollmentApplicationTrainingPathsAction,
  fetchEnrollmentApplicationStudyPlanSpacesAction,
} from "../actions/enrollment-application.actions";

const startAction = jest.mocked(startOrGetEnrollmentApplicationAction);
const updateAction = jest.mocked(updateEnrollmentDraftAction);
const submitAction = jest.mocked(submitEnrollmentApplicationAction);
const cancelAction = jest.mocked(cancelEnrollmentApplicationAction);
const fetchTrainingPathsAction = jest.mocked(fetchEnrollmentApplicationTrainingPathsAction);
const fetchStudyPlanSpacesAction = jest.mocked(fetchEnrollmentApplicationStudyPlanSpacesAction);

const BASE: EnrollmentApplicationResponse = {
  applicationId: "app-1",
  institutionId: "inst-1",
  personId: "person-1",
  studyPlanId: "plan-1",
  academicYearId: "year-1",
  enrollmentPeriodId: "period-1",
  status: "DRAFT",
  isEditable: true,
  data: {},
  createdAt: "2026-03-01T10:00:00Z",
  updatedAt: "2026-03-01T10:00:00Z",
};

const COMPLETE_DRAFT: EnrollmentApplicationResponse = {
  ...BASE,
  data: {
    personalData: {
      firstName: "Lucas",
      lastName: "Mendoza",
      documentNumber: "42111222",
      birthDate: "1990-04-10",
      phoneNumber: "3534999888",
      email: "lucas@example.com",
    },
    academicBackground: { secondarySchool: "Colegio Nacional", secondaryCompleted: true },
    healthInclusion: { receivesReasonableAdjustments: false },
    responsible: {},
    preference: { preferredShift: "MORNING", allowsImageUse: true, isReenrolling: false },
    attachments: [
      { id: "a1", attachmentType: "DNI_FRONT", originalFileName: "dni-f.png" },
      { id: "a2", attachmentType: "DNI_BACK", originalFileName: "dni-d.png" },
      { id: "a3", attachmentType: "PHOTO_ID", originalFileName: "foto.png" },
    ],
  },
};

describe("EnrollmentWizard", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // El wizard dispara un autoguardado apenas termina de cargar el borrador
    // (aunque el usuario no haya tocado nada todavía), así que sin esto la
    // promesa sin resolver revienta el efecto en cada test.
    updateAction.mockResolvedValue(BASE);
    fetchTrainingPathsAction.mockResolvedValue([]);
    fetchStudyPlanSpacesAction.mockResolvedValue([]);
  });

  it("loads the existing draft and populates the personal data step", async () => {
    startAction.mockResolvedValue(COMPLETE_DRAFT);

    render(<EnrollmentWizard studyPlanId="plan-1" academicYearId="year-1" />);

    expect(await screen.findByDisplayValue("Lucas")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Mendoza")).toBeInTheDocument();
    expect(startAction).toHaveBeenCalledWith({ studyPlanId: "plan-1", academicYearId: "year-1" });
  });

  it("autosaves the draft after the applicant edits a field", async () => {
    jest.useFakeTimers({ advanceTimers: true });
    startAction.mockResolvedValue(BASE);
    updateAction.mockResolvedValue(BASE);

    render(<EnrollmentWizard studyPlanId="plan-1" academicYearId="year-1" />);

    const firstNameInput = await screen.findByLabelText(/^nombre/i);
    fireEvent.change(firstNameInput, { target: { value: "Ana" } });

    await act(async () => {
      jest.advanceTimersByTime(900);
    });

    await waitFor(() => expect(updateAction).toHaveBeenCalled());
    const [, payload] = updateAction.mock.calls[updateAction.mock.calls.length - 1];
    expect(payload.data.personalData?.firstName).toBe("Ana");

    jest.useRealTimers();
  });

  it("blocks submission and jumps back to the personal data tab when required fields are missing", async () => {
    startAction.mockResolvedValue(BASE);

    render(<EnrollmentWizard studyPlanId="plan-1" academicYearId="year-1" />);

    await screen.findByLabelText(/^nombre/i);
    await userEvent.click(screen.getByRole("tab", { name: /adjuntos/i }));
    fireEvent.click(screen.getByRole("button", { name: /enviar inscripción/i }));

    expect(await screen.findByText(/campos obligatorios incompletos/i)).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /datos personales/i })).toHaveAttribute("data-state", "active");
    expect(submitAction).not.toHaveBeenCalled();
  });

  it("submits the application when every required field and attachment is present", async () => {
    startAction.mockResolvedValue(COMPLETE_DRAFT);
    updateAction.mockResolvedValue(COMPLETE_DRAFT);
    submitAction.mockResolvedValue({ ...COMPLETE_DRAFT, status: "SUBMITTED" });

    render(<EnrollmentWizard studyPlanId="plan-1" academicYearId="year-1" />);

    await screen.findByDisplayValue("Lucas");
    await userEvent.click(screen.getByRole("tab", { name: /adjuntos/i }));
    fireEvent.click(screen.getByRole("button", { name: /enviar inscripción/i }));

    await waitFor(() => expect(submitAction).toHaveBeenCalledWith("app-1"));
    expect(await screen.findByTestId("status-card")).toHaveTextContent("status:SUBMITTED");
  });

  it("cancels the draft after the applicant confirms the dialog", async () => {
    startAction.mockResolvedValue(BASE);
    cancelAction.mockResolvedValue({ ...BASE, status: "CANCELLED" });

    render(<EnrollmentWizard studyPlanId="plan-1" academicYearId="year-1" />);

    await screen.findByLabelText(/^nombre/i);
    fireEvent.click(screen.getByRole("button", { name: /cancelar borrador/i }));
    fireEvent.click(screen.getByRole("button", { name: /sí, cancelar solicitud/i }));

    await waitFor(() => expect(cancelAction).toHaveBeenCalledWith("app-1"));
    expect(await screen.findByTestId("status-card")).toHaveTextContent("status:CANCELLED");
  });

  it("renders training-path and spaces tabs and loads their data", async () => {
    fetchTrainingPathsAction.mockResolvedValue([
      { id: "tp-1", name: "Formación Básica en Guitarra", description: "Trayecto inicial", active: true, institutionId: "inst-1" },
    ]);
    fetchStudyPlanSpacesAction.mockResolvedValue([
      {
        id: "s-1",
        studyPlanId: "plan-1",
        academicSpaceId: "as-1",
        academicSpaceName: "Práctica de Conjunto",
        academicLevelId: null,
        academicLevelName: null,
        requirementType: "REQUIRED",
        displayOrder: 1,
        approvalMode: "PROMOTION",
        requiresInstrument: false,
        allowedInstruments: [],
      },
    ]);
    startAction.mockResolvedValue(BASE);

    render(<EnrollmentWizard studyPlanId="plan-1" academicYearId="year-1" />);

    expect(await screen.findByRole("tab", { name: /5\. trayecto formativo/i })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /6\. espacios e instrumentos/i })).toBeInTheDocument();

    await userEvent.click(screen.getByRole("tab", { name: /5\. trayecto formativo/i }));
    expect(await screen.findByText("Formación Básica en Guitarra")).toBeInTheDocument();

    await userEvent.click(screen.getByRole("tab", { name: /6\. espacios e instrumentos/i }));
    expect(await screen.findByText("Práctica de Conjunto")).toBeInTheDocument();
  });
});
