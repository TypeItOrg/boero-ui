import * as React from "react";
import { act, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { EnrollmentWizard } from "@features/enrollment-applications/components/EnrollmentWizard";
import type { EnrollmentApplicationResponse } from "@features/enrollment-applications/types/enrollment-application-response.types";
import type { EnrollmentCourseOption } from "@features/enrollment-applications/types/enrollment-course-option.types";

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

const COURSE_OPTION: EnrollmentCourseOption = {
  courseId: "00000000-0000-4000-8000-000000000001",
  studyPlanSpaceId: "00000000-0000-4000-8000-000000000002",
  academicSpaceName: "Práctica de Conjunto",
  academicLevelName: null,
  studyPlanName: "Plan 2026",
  trainingPathName: "Guitarra",
  format: "GRUPAL",
  instrumentId: null,
  instrumentName: null,
  academicYear: 2026,
  eligibility: { eligible: true, requirements: [] },
  hasCapacity: true,
};

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
    careerSelection: { trainingPathId: "00000000-0000-4000-8000-000000000003" },
    courses: [{ courseId: "00000000-0000-4000-8000-000000000001", preferredTeacherId: null }],
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
  return render(<EnrollmentWizard initialApplication={BASE} initialCourseOptions={[COURSE_OPTION]} {...props} />);
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

  it("keeps the training path outside the editable wizard", async () => {
    renderWizard({
      initialApplication: {
        ...BASE,
        data: { careerSelection: { trainingPathId: "tp-1" } },
      },
    });

    expect(screen.queryByRole("tab", { name: /trayecto formativo/i })).not.toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /cursos/i })).toBeInTheDocument();
  });
  it("preserves saved courses and teacher preferences outside the loaded catalog page", async () => {
    const courses = [{ courseId: "00000000-0000-4000-8000-000000000099", preferredTeacherId: "00000000-0000-4000-8000-000000000098" }];
    renderWizard({ initialApplication: { ...COMPLETE_DRAFT, data: { ...COMPLETE_DRAFT.data, courses } } });
    await screen.findByLabelText(/^nombre/i);
    await userEvent.click(screen.getByRole("tab", { name: /escolaridad/i }));
    fireEvent.change(screen.getByLabelText(/colegio secundario/i), { target: { value: "Otro colegio" } });
    await waitFor(() => expect(updateAction).toHaveBeenCalled(), { timeout: 3000 });
    expect(updateAction.mock.calls.at(-1)?.[1].data.courses).toEqual(courses);
  });
});
