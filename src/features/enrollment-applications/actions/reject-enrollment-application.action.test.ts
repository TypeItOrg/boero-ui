jest.mock("next/cache", () => ({
  revalidatePath: jest.fn(),
}));

jest.mock("@features/enrollment-applications/services/enrollment-application-api-fetch.service", () => ({
  enrollmentApplicationApiFetch: jest.fn(),
}));

import { revalidatePath } from "next/cache";

import { rejectEnrollmentApplicationAction } from "@features/enrollment-applications/actions/reject-enrollment-application.action";
import { enrollmentApplicationApiFetch } from "@features/enrollment-applications/services/enrollment-application-api-fetch.service";

const INSTITUTION_ID = "00000000-0000-4000-8000-000000000001";
const APPLICATION_ID = "00000000-0000-4000-8000-000000000002";

function createFormData(rejectionReason: string): FormData {
  const formData = new FormData();
  formData.set("rejectionReason", rejectionReason);
  return formData;
}

describe("rejectEnrollmentApplicationAction", () => {
  const enrollmentApplicationApiFetchMock = jest.mocked(enrollmentApplicationApiFetch);
  const revalidatePathMock = jest.mocked(revalidatePath);

  beforeEach(() => {
    enrollmentApplicationApiFetchMock.mockReset();
    revalidatePathMock.mockReset();
  });

  it("rejects the enrollment application with the given reason", async () => {
    enrollmentApplicationApiFetchMock.mockResolvedValue(new Response(null, { status: 200 }));

    const result = await rejectEnrollmentApplicationAction(
      INSTITUTION_ID,
      APPLICATION_ID,
      { success: false },
      createFormData("Documentación incompleta"),
    );

    expect(result).toEqual({ success: true });
    const [path, request] = enrollmentApplicationApiFetchMock.mock.calls[0];
    expect(path).toBe(`/api/v1/institutions/${INSTITUTION_ID}/enrollment-applications/${APPLICATION_ID}/reject`);
    expect(request?.method).toBe("POST");
    expect(JSON.parse(request?.body as string)).toEqual({ rejectionReason: "Documentación incompleta" });
    expect(revalidatePathMock).toHaveBeenCalledWith("/enrollment-applications");
  });

  it("returns the error when the backend rejects the request", async () => {
    enrollmentApplicationApiFetchMock.mockResolvedValue(
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
    expect(enrollmentApplicationApiFetchMock).not.toHaveBeenCalled();
  });

  it("returns a validation error when the rejection reason is too long", async () => {
    const result = await rejectEnrollmentApplicationAction(INSTITUTION_ID, APPLICATION_ID, { success: false }, createFormData("x".repeat(1001)));

    expect(result.fieldErrors).toEqual({
      rejectionReason: "El motivo no puede superar los 1000 caracteres.",
    });
    expect(enrollmentApplicationApiFetchMock).not.toHaveBeenCalled();
  });

  it("returns an error when the action arguments are invalid", async () => {
    const result = await rejectEnrollmentApplicationAction(
      "not-a-uuid",
      APPLICATION_ID,
      { success: false },
      createFormData("Documentación incompleta"),
    );

    expect(result).toEqual({ error: "La solicitud no es válida." });
    expect(enrollmentApplicationApiFetchMock).not.toHaveBeenCalled();
  });
});
