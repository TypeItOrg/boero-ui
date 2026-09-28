jest.mock("next/headers", () => ({
  cookies: jest.fn(),
}));

import { cookies } from "next/headers";

import { GUARDIAN_WORKSPACE_COOKIE, GUARDIAN_WORKSPACE_MAX_AGE } from "@features/guardian-workspace/constants/guardian-workspace.constants";
import {
  clearGuardianWorkspaceId,
  getGuardianWorkspaceId,
  setGuardianWorkspaceId,
} from "@features/guardian-workspace/utils/guardian-workspace-cookie.util";

describe("guardian workspace cookie", () => {
  const cookieStore = {
    delete: jest.fn(),
    get: jest.fn(),
    set: jest.fn(),
  };

  beforeEach(() => {
    jest.mocked(cookies).mockResolvedValue(cookieStore as never);
    cookieStore.delete.mockReset();
    cookieStore.get.mockReset();
    cookieStore.set.mockReset();
  });

  it("reads the active dependent id", async () => {
    cookieStore.get.mockReturnValue({ value: "019f9c3a-f891-7bc5-a98d-e65332998002" });

    await expect(getGuardianWorkspaceId()).resolves.toBe("019f9c3a-f891-7bc5-a98d-e65332998002");
  });

  it("persists the active dependent id", async () => {
    await setGuardianWorkspaceId("019f9c3a-f891-7bc5-a98d-e65332998002");

    expect(cookieStore.set).toHaveBeenCalledWith(
      GUARDIAN_WORKSPACE_COOKIE,
      "019f9c3a-f891-7bc5-a98d-e65332998002",
      expect.objectContaining({ httpOnly: true, maxAge: GUARDIAN_WORKSPACE_MAX_AGE, path: "/", sameSite: "lax" }),
    );
  });

  it("clears the active dependent id", async () => {
    await clearGuardianWorkspaceId();

    expect(cookieStore.delete).toHaveBeenCalledWith(GUARDIAN_WORKSPACE_COOKIE);
  });
});
