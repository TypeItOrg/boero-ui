import { readBackendErrorCode } from "@features/institutional-auth/utils/backend-error-code.util";

describe("readBackendErrorCode", () => {
  it("returns the machine-readable code when present", async () => {
    const response = new Response(JSON.stringify({ status: 403, message: "Necesitás reautenticarte.", code: "RECENT_AUTHENTICATION_REQUIRED" }), {
      status: 403,
    });

    await expect(readBackendErrorCode(response)).resolves.toBe("RECENT_AUTHENTICATION_REQUIRED");
  });

  it("returns undefined when the body carries no code", async () => {
    const response = new Response(JSON.stringify({ status: 403, message: "Denegado." }), { status: 403 });

    await expect(readBackendErrorCode(response)).resolves.toBeUndefined();
  });

  it("returns undefined for empty or unreadable bodies", async () => {
    await expect(readBackendErrorCode(new Response(null, { status: 403 }))).resolves.toBeUndefined();
    await expect(readBackendErrorCode(new Response("not-json", { status: 403 }))).resolves.toBeUndefined();
  });
});
