jest.mock("next/cache", () => ({
  revalidatePath: jest.fn(),
}));

jest.mock("@features/enrollment-applications/services/enrollment-application-api-fetch.service", () => ({
  enrollmentApplicationApiFetch: jest.fn(),
}));

import { revalidatePath } from "next/cache";

import { approveEnrollmentApplicationAction } from "@features/enrollment-applications/actions/approve-enrollment-application.action";
import { enrollmentApplicationApiFetch } from "@features/enrollment-applications/services/enrollment-application-api-fetch.service";

const INSTITUTION_ID = "00000000-0000-4000-8000-000000000001";
const APPLICATION_ID = "00000000-0000-4000-8000-000000000002";

describe("approveEnrollmentApplicationAction", () => {
  const enrollmentApplicationApiFetchMock = jest.mocked(enrollmentApplicationApiFetch);
  const revalidatePathMock = jest.mocked(revalidatePath);

  beforeEach(() => {
    enrollmentApplicationApiFetchMock.mockReset();
    revalidatePathMock.mockReset();
  });

  it("approves the enrollment application successfully", async () => {
    enrollmentApplicationApiFetchMock.mockResolvedValue(new Response(null, { status: 200 }));

    const result = await approveEnrollmentApplicationAction(INSTITUTION_ID, APPLICATION_ID);

    expect(result).toEqual({ success: true });
    const [path, request] = enrollmentApplicationApiFetchMock.mock.calls[0];
    expect(path).toBe(`/api/v1/institutions/${INSTITUTION_ID}/enrollment-applications/${APPLICATION_ID}/approve`);
    expect(request?.method).toBe("POST");
    expect(revalidatePathMock).toHaveBeenCalledWith("/enrollment-applications");
  });

  it("returns the error when the backend rejects the approval", async () => {
    enrollmentApplicationApiFetchMock.mockResolvedValue(
      new Response(JSON.stringify({ message: "La solicitud ya fue evaluada", status: 409 }), {
        status: 409,
        headers: { "Content-Type": "application/json" },
      }),
    );

    const result = await approveEnrollmentApplicationAction(INSTITUTION_ID, APPLICATION_ID);

    expect(result).toEqual({ error: "La solicitud ya fue evaluada" });
  });
});
