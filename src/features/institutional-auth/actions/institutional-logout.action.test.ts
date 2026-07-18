jest.mock("next/navigation", () => ({
  redirect: jest.fn(),
}));

jest.mock("@features/institutional-auth/services/logout-institutional-account.service", () => ({
  logoutInstitutionalAccount: jest.fn(),
}));

jest.mock("@features/institutional-auth/utils/institutional-auth-cookies.util", () => ({
  clearInstitutionalAuthCookies: jest.fn(),
}));

import { redirect } from "next/navigation";

import { logoutInstitutional } from "@features/institutional-auth/actions/institutional-logout.action";
import { logoutInstitutionalAccount } from "@features/institutional-auth/services/logout-institutional-account.service";
import { clearInstitutionalAuthCookies } from "@features/institutional-auth/utils/institutional-auth-cookies.util";

describe("logoutInstitutional", () => {
  beforeEach(() => {
    jest.mocked(logoutInstitutionalAccount).mockReset();
    jest.mocked(clearInstitutionalAuthCookies).mockReset();
    jest.mocked(redirect).mockReset();
  });

  it("closes the remote and local sessions before redirecting to login", async () => {
    await logoutInstitutional();

    expect(logoutInstitutionalAccount).toHaveBeenCalled();
    expect(clearInstitutionalAuthCookies).toHaveBeenCalled();
    expect(redirect).toHaveBeenCalledWith("/auth/login");
  });
});
