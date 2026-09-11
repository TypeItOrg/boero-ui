jest.mock("next/cache", () => ({
  revalidatePath: jest.fn(),
}));

jest.mock("@features/institutional-auth/services/institutional-api-fetch.service", () => ({
  institutionalApiFetch: jest.fn(),
}));

import { revalidatePath } from "next/cache";

import { approveEnrollmentApplicationAction } from "@features/enrollment-applications/actions/approve-enrollment-application.action";
import { institutionalApiFetch } from "@features/institutional-auth/services/institutional-api-fetch.service";

const INSTITUTION_ID = "00000000-0000-4000-8000-000000000001";
const APPLICATION_ID = "00000000-0000-4000-8000-000000000002";

describe("approveEnrollmentApplicationAction", () => {
  const institutionalApiFetchMock = jest.mocked(institutionalApiFetch);
  const revalidatePathMock = jest.mocked(revalidatePath);

  beforeEach(() => {
    institutionalApiFetchMock.mockReset();
    revalidatePathMock.mockReset();
  });

  it("approves the enrollment application successfully", async () => {
    institutionalApiFetchMock.mockResolvedValue(new Response(null, { status: 200 }));

    const result = await approveEnrollmentApplicationAction(INSTITUTION_ID, APPLICATION_ID);

    expect(result).toEqual({ success: true });
    const [path, request] = institutionalApiFetchMock.mock.calls[0];
    expect(path).toBe(`/api/v1/institutions/${INSTITUTION_ID}/enrollment-applications/${APPLICATION_ID}/approve`);
    expect(request?.method).toBe("POST");
    expect(revalidatePathMock).toHaveBeenCalledWith("/enrollment-applications");
  });

  it("returns the error when the backend rejects the approval", async () => {
    institutionalApiFetchMock.mockResolvedValue(
      new Response(JSON.stringify({ message: "La solicitud ya fue evaluada", status: 409 }), {
        status: 409,
        headers: { "Content-Type": "application/json" },
      }),
    );

    const result = await approveEnrollmentApplicationAction(INSTITUTION_ID, APPLICATION_ID);

    expect(result).toEqual({ error: "La solicitud ya fue evaluada" });
  });
});
