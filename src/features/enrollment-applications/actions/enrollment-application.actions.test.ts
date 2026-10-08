jest.mock("@features/enrollment-applications/services/mutate-enrollment-application.service", () => ({
  mutateEnrollmentApplication: jest.fn(),
}));

jest.mock("@features/enrollment-applications/utils/can-mutate-enrollment-application.util", () => ({
  canMutateEnrollmentApplication: jest.fn(),
  canStartEnrollmentApplication: jest.fn(),
}));

import {
  cancelEnrollmentApplicationAction,
  submitEnrollmentApplicationAction,
  updateEnrollmentDraftAction,
} from "@features/enrollment-applications/actions/enrollment-application.actions";
import { changeEnrollmentCareerAction } from "@features/enrollment-applications/actions/change-enrollment-career.action";
import { mutateEnrollmentApplication } from "@features/enrollment-applications/services/mutate-enrollment-application.service";
import {
  canMutateEnrollmentApplication,
  canStartEnrollmentApplication,
} from "@features/enrollment-applications/utils/can-mutate-enrollment-application.util";

const APPLICATION_ID = "00000000-0000-4000-8000-000000000001";
const TRAINING_PATH_ID = "00000000-0000-4000-8000-000000000002";

describe("enrollment application mutation actions", () => {
  const canMutateMock = jest.mocked(canMutateEnrollmentApplication);
  const canStartMock = jest.mocked(canStartEnrollmentApplication);
  const mutateMock = jest.mocked(mutateEnrollmentApplication);

  beforeEach(() => {
    jest.clearAllMocks();
    canMutateMock.mockResolvedValue(true);
    canStartMock.mockResolvedValue(true);
    mutateMock.mockResolvedValue({ application: {} as never });
  });

  it("rejects starting an application outside the active workspace", async () => {
    canStartMock.mockResolvedValue(false);

    const { startOrGetEnrollmentApplicationAction } = await import("@features/enrollment-applications/actions/enrollment-application.actions");
    const result = await startOrGetEnrollmentApplicationAction({
      trainingPathId: "00000000-0000-4000-8000-000000000003",
      applicantPersonId: "00000000-0000-4000-8000-000000000005",
    });

    expect(result).toEqual({ error: "La solicitud no es válida." });
    expect(mutateMock).not.toHaveBeenCalled();
  });

  it.each([
    ["update", () => updateEnrollmentDraftAction(APPLICATION_ID, { data: {} })],
    ["career change", () => changeEnrollmentCareerAction(APPLICATION_ID, TRAINING_PATH_ID)],
    ["submit", () => submitEnrollmentApplicationAction(APPLICATION_ID)],
    ["cancel", () => cancelEnrollmentApplicationAction(APPLICATION_ID)],
  ])("rejects %s when the application is outside the active workspace", async (_operation, action) => {
    canMutateMock.mockResolvedValue(false);

    await expect(action()).resolves.toEqual({ error: "La solicitud no es válida." });
    expect(mutateMock).not.toHaveBeenCalled();
  });

  it("updates a draft after the workspace guard succeeds", async () => {
    await updateEnrollmentDraftAction(APPLICATION_ID, { data: {} });

    expect(mutateMock).toHaveBeenCalledWith(`/api/v1/enrollment-applications/${APPLICATION_ID}/draft`, "PATCH", "Error al guardar el borrador", {
      data: {},
    });
  });

  it("submits after the workspace guard succeeds", async () => {
    await submitEnrollmentApplicationAction(APPLICATION_ID);

    expect(mutateMock).toHaveBeenCalledWith(`/api/v1/enrollment-applications/${APPLICATION_ID}/submit`, "POST", "No se pudo enviar la inscripción.");
  });

  it("changes career after the workspace guard succeeds", async () => {
    await changeEnrollmentCareerAction(APPLICATION_ID, TRAINING_PATH_ID);

    expect(mutateMock).toHaveBeenCalledWith(
      `/api/v1/enrollment-applications/${APPLICATION_ID}/draft`,
      "PATCH",
      "No se pudo cambiar el trayecto formativo.",
      { data: { careerSelection: { trainingPathId: TRAINING_PATH_ID } } },
    );
  });

  it("cancels after the workspace guard succeeds", async () => {
    await cancelEnrollmentApplicationAction(APPLICATION_ID);

    expect(mutateMock).toHaveBeenCalledWith(
      `/api/v1/enrollment-applications/${APPLICATION_ID}/cancel`,
      "POST",
      "Error al cancelar la solicitud de inscripción",
    );
  });
});
