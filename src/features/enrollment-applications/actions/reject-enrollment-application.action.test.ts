jest.mock("next/cache", () => ({
  revalidatePath: jest.fn(),
}));

jest.mock("@features/institutional-auth/services/institutional-api-fetch.service", () => ({
  institutionalApiFetch: jest.fn(),
}));

import { revalidatePath } from "next/cache";

import { rejectEnrollmentApplicationAction } from "@features/enrollment-applications/actions/reject-enrollment-application.action";
import { institutionalApiFetch } from "@features/institutional-auth/services/institutional-api-fetch.service";

const INSTITUTION_ID = "00000000-0000-4000-8000-000000000001";
const APPLICATION_ID = "00000000-0000-4000-8000-000000000002";

function createFormData(rejectionReason: string): FormData {
  const formData = new FormData();
  formData.set("rejectionReason", rejectionReason);
  return formData;
}

describe("rejectEnrollmentApplicationAction", () => {
  const institutionalApiFetchMock = jest.mocked(institutionalApiFetch);
  const revalidatePathMock = jest.mocked(revalidatePath);

  beforeEach(() => {
    institutionalApiFetchMock.mockReset();
    revalidatePathMock.mockReset();
  });

  it("rejects the enrollment application with the given reason", async () => {
    institutionalApiFetchMock.mockResolvedValue(new Response(null, { status: 200 }));

    const result = await rejectEnrollmentApplicationAction(
      INSTITUTION_ID,
      APPLICATION_ID,
      { success: false },
      createFormData("Documentación incompleta"),
    );

    expect(result).toEqual({ success: true });
    const [path, request] = institutionalApiFetchMock.mock.calls[0];
    expect(path).toBe(`/api/v1/institutions/${INSTITUTION_ID}/enrollment-applications/${APPLICATION_ID}/reject`);
    expect(request?.method).toBe("POST");
    expect(JSON.parse(request?.body as string)).toEqual({ rejectionReason: "Documentación incompleta" });
    expect(revalidatePathMock).toHaveBeenCalledWith("/enrollment-applications");
  });

  it("returns the error when the backend rejects the request", async () => {
    institutionalApiFetchMock.mockResolvedValue(
      new Response(JSON.stringify({ message: "La solicitud ya fue evaluada", status: 409 }), {
        status: 409,
        headers: { "Content-Type": "application/json" },
      }),
    );

    const result = await rejectEnrollmentApplicationAction(
      INSTITUTION_ID,
      APPLICATION_ID,
      { success: false },
      createFormData("Documentación incompleta"),
    );

    expect(result).toEqual({ error: "La solicitud ya fue evaluada" });
  });

  it("returns a validation error when the rejection reason is empty", async () => {
    const result = await rejectEnrollmentApplicationAction(INSTITUTION_ID, APPLICATION_ID, { success: false }, createFormData("   "));

    expect(result.fieldErrors).toEqual({
      rejectionReason: "Debés indicar el motivo del rechazo.",
    });
    expect(institutionalApiFetchMock).not.toHaveBeenCalled();
  });

  it("returns a validation error when the rejection reason is too long", async () => {
    const result = await rejectEnrollmentApplicationAction(INSTITUTION_ID, APPLICATION_ID, { success: false }, createFormData("x".repeat(1001)));

    expect(result.fieldErrors).toEqual({
      rejectionReason: "El motivo no puede superar los 1000 caracteres.",
    });
    expect(institutionalApiFetchMock).not.toHaveBeenCalled();
  });

  it("returns an error when the action arguments are invalid", async () => {
    const result = await rejectEnrollmentApplicationAction(
      "not-a-uuid",
      APPLICATION_ID,
      { success: false },
      createFormData("Documentación incompleta"),
    );

    expect(result).toEqual({ error: "La solicitud no es válida." });
    expect(institutionalApiFetchMock).not.toHaveBeenCalled();
  });
});
