jest.mock("@features/enrollment-applications/services/enrollment-spaces-client.service", () => ({ fetchEnrollmentSpaces: jest.fn() }));
jest.mock("@features/enrollment-applications/actions/change-enrollment-career.action", () => ({ changeEnrollmentCareerAction: jest.fn() }));
import { fetchEnrollmentSpaces } from "@features/enrollment-applications/services/enrollment-spaces-client.service";
import { changeEnrollmentCareerAction } from "@features/enrollment-applications/actions/change-enrollment-career.action";
import * as React from "react";
import { act, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { EnrollmentWizard } from "@features/enrollment-applications/components/EnrollmentWizard";
import type { StudyPlanSpace } from "@features/academic/types/study-plan-space.types";
import type { TrainingPath } from "@features/academic/types/training-path.types";
import type { EnrollmentApplicationResponse } from "@features/enrollment-applications/types/enrollment-application-response.types";

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    refresh: jest.fn(),
  }),
  usePathname: () => "/my-enrollment-applications/app-1",
  useSearchParams: () => new URLSearchParams(),
}));

jest.mock("@features/enrollment-applications/components/EnrollmentStatusCard", () => ({
  EnrollmentStatusCard: ({ application }: { application: EnrollmentApplicationResponse }) => (
    <div data-testid="status-card">status:{application.status}</div>
  ),
}));

jest.mock("@features/enrollment-applications/actions/enrollment-application.actions", () => ({
  updateEnrollmentDraftAction: jest.fn(),
  submitEnrollmentApplicationAction: jest.fn(),
  cancelEnrollmentApplicationAction: jest.fn(),
}));

import {
  updateEnrollmentDraftAction,
  submitEnrollmentApplicationAction,
  cancelEnrollmentApplicationAction,
} from "@features/enrollment-applications/actions/enrollment-application.actions";

const updateAction = jest.mocked(updateEnrollmentDraftAction);
const submitAction = jest.mocked(submitEnrollmentApplicationAction);
const cancelAction = jest.mocked(cancelEnrollmentApplicationAction);
const fetchStudyPlanSpacesAction = jest.mocked(fetchEnrollmentSpaces);

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
    academicSpaceSelection: { studyPlanSpaceIds: ["s-1"] },
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

function renderWizard(props: Partial<React.ComponentProps<typeof EnrollmentWizard>> = {}): ReturnType<typeof render> {
  return render(<EnrollmentWizard initialApplication={BASE} initialStudyPlanSpaces={[]} initialTrainingPaths={[]} {...props} />);
}

async function confirmSubmission(): Promise<void> {
  fireEvent.click(screen.getByRole("button", { name: "Enviar inscripción" }));
  const dialog = await screen.findByRole("alertdialog");
  fireEvent.click(within(dialog).getByRole("button", { name: "Enviar inscripción" }));
}

describe("EnrollmentWizard", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // El wizard dispara un autoguardado apenas termina de cargar el borrador
    // (aunque el usuario no haya tocado nada todavía), así que sin esto la
    // promesa sin resolver revienta el efecto en cada test.
    updateAction.mockResolvedValue({ application: BASE });
    fetchStudyPlanSpacesAction.mockResolvedValue([]);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("populates the personal data step from the initial application", async () => {
    renderWizard({ initialApplication: COMPLETE_DRAFT });

    expect(await screen.findByDisplayValue("Lucas")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Mendoza")).toBeInTheDocument();
  });

  it("autosaves the draft after the applicant edits a field", async () => {
    updateAction.mockResolvedValue({ application: BASE });

    renderWizard();

    await screen.findByLabelText(/^nombre/i);
    await userEvent.click(screen.getByRole("tab", { name: /escolaridad/i }));
    const schoolInput = await screen.findByLabelText(/colegio secundario/i);

    jest.useFakeTimers();
    try {
      fireEvent.change(schoolInput, { target: { value: "Colegio Nacional" } });

      act(() => {
        jest.advanceTimersByTime(900);
      });
    } finally {
      jest.useRealTimers();
    }

    await waitFor(() => expect(updateAction).toHaveBeenCalled());
    const [, payload] = updateAction.mock.calls[updateAction.mock.calls.length - 1];
    expect(payload.data.academicBackground?.secondarySchool).toBe("Colegio Nacional");
  });

  it("blocks submission, jumps back to the personal data tab and focuses the first invalid field when required fields are missing", async () => {
    renderWizard();

    await screen.findByLabelText(/^nombre/i);
    await userEvent.click(screen.getByRole("tab", { name: /preferencias/i }));
    await confirmSubmission();

    expect(await screen.findByText("Campos obligatorios incompletos")).toBeInTheDocument();
    fireEvent.click(within(screen.getByRole("alertdialog")).getByRole("button", { name: "Volver" }));
    expect(screen.getByRole("tab", { name: /datos personales/i })).toHaveAttribute("data-state", "active");
    expect(submitAction).not.toHaveBeenCalled();

    // The "personal" tab remounts its inputs when navigated back to, so the
    // focused element must be re-queried rather than reusing the stale node.
    const refocusedFirstNameInput = await screen.findByLabelText(/^nombre/i);
    await waitFor(() => expect(refocusedFirstNameInput).toHaveFocus());
    expect(refocusedFirstNameInput).toHaveAttribute("aria-invalid", "true");
  });

  it("submits the application when every required field is present", async () => {
    updateAction.mockResolvedValue({ application: COMPLETE_DRAFT });
    submitAction.mockResolvedValue({ application: { ...COMPLETE_DRAFT, status: "SUBMITTED" } });

    renderWizard({ initialApplication: COMPLETE_DRAFT });

    await screen.findByDisplayValue("Lucas");
    await userEvent.click(screen.getByRole("tab", { name: /preferencias/i }));
    await confirmSubmission();

    await waitFor(() => expect(submitAction).toHaveBeenCalledWith("app-1"));
    expect(await screen.findByTestId("status-card")).toHaveTextContent("status:SUBMITTED");
  });

  it("cancels the draft after the applicant confirms the dialog", async () => {
    cancelAction.mockResolvedValue({ application: { ...BASE, status: "CANCELLED" } });

    renderWizard();

    await screen.findByLabelText(/^nombre/i);
    fireEvent.click(screen.getByRole("button", { name: "Cancelar" }));
    const dialog = await screen.findByRole("alertdialog");
    fireEvent.click(within(dialog).getByRole("button", { name: "Cancelar inscripción" }));

    await waitFor(() => expect(cancelAction).toHaveBeenCalledWith("app-1"));
    expect(await screen.findByTestId("status-card")).toHaveTextContent("status:CANCELLED");
  });

  it("does not render responsible tab for adult applicant", async () => {
    renderWizard();

    await screen.findByLabelText(/^nombre/i);
    expect(screen.queryByRole("tab", { name: /tutor legal/i })).not.toBeInTheDocument();
  });

  it("renders responsible tab when applicant is a minor (< 18)", async () => {
    renderWizard({
      initialApplication: {
        ...BASE,
        data: {
          personalData: {
            ...BASE.data.personalData,
            birthDate: "2015-05-12",
          },
        },
      },
    });

    await screen.findByLabelText(/^nombre/i);
    expect(screen.getByRole("tab", { name: /tutor legal/i })).toBeInTheDocument();
  });

  it("names the dependent being enrolled and marks the missing email as not applicable", async () => {
    renderWizard({
      initialApplication: {
        ...BASE,
        submittedByPersonId: "guardian-1",
        data: { personalData: { firstName: "Mateo", lastName: "Gonzalez", birthDate: "2015-05-12" } },
      },
    });

    expect(await screen.findByText("Inscribiendo a: Mateo Gonzalez")).toBeInTheDocument();
    expect(screen.getByLabelText(/correo electrónico/i)).toHaveValue("No aplica");
  });

  it("does not show the enrolling notice when applying for yourself", async () => {
    renderWizard({ initialApplication: { ...BASE, submittedByPersonId: BASE.personId } });

    await screen.findByLabelText(/^nombre/i);
    expect(screen.queryByText(/Inscribiendo a:/)).not.toBeInTheDocument();
  });

  it("renders training-path and spaces tabs and loads their data", async () => {
    const trainingPaths: TrainingPath[] = [
      { id: "tp-1", name: "Formación Básica en Guitarra", description: "Trayecto inicial", active: true, institutionId: "inst-1" },
    ];
    const studyPlanSpaces: StudyPlanSpace[] = [
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
    ];

    renderWizard({ initialTrainingPaths: trainingPaths, initialStudyPlanSpaces: studyPlanSpaces });

    expect(await screen.findByRole("tab", { name: /trayecto formativo/i })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /espacios e instrumentos/i })).toBeInTheDocument();

    await userEvent.click(screen.getByRole("tab", { name: /trayecto formativo/i }));
    expect(await screen.findByText("Formación Básica en Guitarra")).toBeInTheDocument();

    await userEvent.click(screen.getByRole("tab", { name: /espacios e instrumentos/i }));
    expect(await screen.findByText("Práctica de Conjunto")).toBeInTheDocument();
  });

  it("clears previously selected spaces and instruments when the applicant changes training path", async () => {
    const DRAFT_WITH_CAREER: EnrollmentApplicationResponse = {
      ...BASE,
      data: {
        careerSelection: { trainingPathId: "tp-1" },
        academicSpaceSelection: { studyPlanSpaceIds: ["s-1"] },
        instrumentSelection: { studyPlanSpaceInstrumentIds: { "s-1": "inst-1" } },
      },
    };

    jest.mocked(changeEnrollmentCareerAction).mockResolvedValue({
      application: {
        ...DRAFT_WITH_CAREER,
        data: {
          careerSelection: { trainingPathId: "tp-2" },
          academicSpaceSelection: { studyPlanSpaceIds: [] },
          instrumentSelection: { studyPlanSpaceInstrumentIds: {} },
        },
      },
    });
    updateAction.mockResolvedValue({ application: DRAFT_WITH_CAREER });
    const trainingPaths: TrainingPath[] = [
      { id: "tp-1", name: "Guitarra", description: "", active: true, institutionId: "inst-1" },
      { id: "tp-2", name: "Piano", description: "", active: true, institutionId: "inst-1" },
    ];
    const studyPlanSpaces: StudyPlanSpace[] = [
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
        requiresInstrument: true,
        allowedInstruments: [{ instrumentId: "inst-1", name: "Guitarra" }],
      },
    ];
    fetchStudyPlanSpacesAction.mockResolvedValue(studyPlanSpaces);

    renderWizard({ initialApplication: DRAFT_WITH_CAREER, initialTrainingPaths: trainingPaths, initialStudyPlanSpaces: studyPlanSpaces });

    const tab = await screen.findByRole("tab", { name: /trayecto formativo/i });
    await userEvent.click(tab);
    expect(await screen.findByText("Guitarra")).toBeInTheDocument();

    jest.useFakeTimers();
    try {
      fireEvent.click(screen.getByText("Piano"));

      act(() => {
        jest.advanceTimersByTime(900);
      });
    } finally {
      jest.useRealTimers();
    }

    await waitFor(() => {
      const [, payload] = updateAction.mock.calls[updateAction.mock.calls.length - 1];
      expect(payload.data.careerSelection).toEqual({ trainingPathId: "tp-2" });
      expect(payload.data.academicSpaceSelection).toEqual({ studyPlanSpaceIds: [] });
      expect(payload.data.instrumentSelection).toBeUndefined();
    });
  });

  it("blocks submission when an available training path was not selected", async () => {
    updateAction.mockResolvedValue({ application: COMPLETE_DRAFT });

    renderWizard({
      initialApplication: COMPLETE_DRAFT,
      initialTrainingPaths: [{ id: "tp-1", name: "Guitarra", description: "", active: true, institutionId: "inst-1" }],
    });

    await screen.findByDisplayValue("Lucas");
    await userEvent.click(screen.getByRole("tab", { name: /preferencias/i }));
    await confirmSubmission();

    const dialog = await screen.findByRole("alertdialog");
    expect(within(dialog).getByText("Hay 1 campo obligatorio incompleto.")).toBeInTheDocument();
    fireEvent.click(within(dialog).getByRole("button", { name: "Volver" }));
    expect(screen.getAllByText("Debés seleccionar un trayecto formativo.")).toHaveLength(2);
    expect(screen.getByRole("tab", { name: /trayecto formativo/i })).toHaveAttribute("data-state", "active");
    expect(submitAction).not.toHaveBeenCalled();
  });

  it("blocks submission after spaces fail to reload for a changed training path", async () => {
    const application: EnrollmentApplicationResponse = {
      ...COMPLETE_DRAFT,
      data: { ...COMPLETE_DRAFT.data, careerSelection: { trainingPathId: "tp-1" } },
    };
    const trainingPaths: TrainingPath[] = [
      { id: "tp-1", name: "Guitarra", description: "", active: true, institutionId: "inst-1" },
      { id: "tp-2", name: "Piano", description: "", active: true, institutionId: "inst-1" },
    ];
    updateAction.mockResolvedValue({ application: COMPLETE_DRAFT });
    fetchStudyPlanSpacesAction.mockRejectedValue(new Error("network error"));
    jest.mocked(changeEnrollmentCareerAction).mockResolvedValue({
      application: { ...application, data: { ...application.data, careerSelection: { trainingPathId: "tp-2" } } },
    });

    renderWizard({ initialApplication: application, initialTrainingPaths: trainingPaths });

    await screen.findByDisplayValue("Lucas");
    await userEvent.click(screen.getByRole("tab", { name: /trayecto formativo/i }));
    fireEvent.click(screen.getByText("Piano"));
    await waitFor(() => expect(fetchStudyPlanSpacesAction).toHaveBeenCalledWith("app-1"));
    await userEvent.click(screen.getByRole("tab", { name: /preferencias/i }));
    await confirmSubmission();

    expect(await screen.findByText("No se pudieron cargar los espacios académicos. Reintentá antes de enviar.")).toBeInTheDocument();
    fireEvent.click(within(screen.getByRole("alertdialog")).getByRole("button", { name: "Volver" }));
    expect(screen.getByRole("tab", { name: /espacios e instrumentos/i })).toHaveAttribute("data-state", "active");
    expect(submitAction).not.toHaveBeenCalled();
  });
});
