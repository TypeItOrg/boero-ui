import { revalidatePath } from "next/cache";

import { resolveGuardianLinkAction } from "@features/guardian-links/actions/resolve-guardian-link.action";
import { GUARDIAN_LINKS_PAGE_PATH } from "@features/guardian-links/constants/guardian-link.constants";
import { requireInstitutionalUser } from "@features/institutional-auth/services/get-institutional-user.service";
import { institutionalApiFetch } from "@features/institutional-auth/services/institutional-api-fetch.service";
import { INSTITUTIONAL_PERMISSION } from "@features/institutional-auth/types/institutional-permission.types";

jest.mock("next/cache", () => ({ revalidatePath: jest.fn() }));
jest.mock("@features/institutional-auth/services/institutional-api-fetch.service", () => ({ institutionalApiFetch: jest.fn() }));
jest.mock("@features/institutional-auth/services/get-institutional-user.service", () => ({ requireInstitutionalUser: jest.fn() }));

const INSTITUTION_ID = "00000000-0000-4000-8000-000000000001";
const LINK_ID = "00000000-0000-4000-8000-0000000000aa";

function givenUser(overrides: { institutionId?: string; permissions?: string[] } = {}): void {
  jest.mocked(requireInstitutionalUser).mockResolvedValue({
    userId: "user-id",
    personId: "person-id",
    name: "Ana",
    lastName: "Pérez",
    documentNumber: "20111222",
    institutionId: overrides.institutionId ?? INSTITUTION_ID,
    roles: ["Administrativo"],
    permissions: overrides.permissions ?? [INSTITUTIONAL_PERMISSION.GUARDIAN_LINK_REVIEW],
  });
}

describe("resolveGuardianLinkAction", () => {
  const apiFetchMock = jest.mocked(institutionalApiFetch);

  beforeEach(() => {
    apiFetchMock.mockReset();
    jest.mocked(revalidatePath).mockReset();
    givenUser();
  });

  it.each(["approve", "reject"] as const)("sends the %s decision and refreshes the requests page", async (decision) => {
    apiFetchMock.mockResolvedValue(Response.json({ status: "ACTIVE" }));

    const result = await resolveGuardianLinkAction(INSTITUTION_ID, LINK_ID, decision);

    expect(result).toEqual({ success: true });
    const [path, request] = apiFetchMock.mock.calls[0];
    expect(path).toBe(`/api/v1/institutions/${INSTITUTION_ID}/guardian-links/${LINK_ID}/${decision}`);
    expect(request?.method).toBe("POST");
    expect(revalidatePath).toHaveBeenCalledWith(GUARDIAN_LINKS_PAGE_PATH);
  });

  it.each([
    ["an invalid link id", INSTITUTION_ID, "nope", "approve"],
    ["an invalid institution id", "nope", LINK_ID, "approve"],
    ["an unknown decision", INSTITUTION_ID, LINK_ID, "delete"],
  ])("does not call the backend with %s", async (_label, institutionId, linkId, decision) => {
    const result = await resolveGuardianLinkAction(institutionId, linkId, decision as "approve");

    expect(result.error).toBeDefined();
    expect(apiFetchMock).not.toHaveBeenCalled();
  });

  it.each([
    ["the user lacks the permission", { permissions: [] }],
    ["the institution is another one", { institutionId: "00000000-0000-4000-8000-000000000099" }],
  ])("does not call the backend when %s", async (_label, user) => {
    givenUser(user);

    const result = await resolveGuardianLinkAction(INSTITUTION_ID, LINK_ID, "approve");

    expect(result.error).toBeDefined();
    expect(apiFetchMock).not.toHaveBeenCalled();
  });

  it("surfaces the backend error when the request was already resolved", async () => {
    apiFetchMock.mockResolvedValue(
      Response.json(
        { status: 409, message: "La solicitud de vinculación ya fue resuelta.", code: "GUARDIAN_LINK_ALREADY_RESOLVED" },
        { status: 409 },
      ),
    );

    const result = await resolveGuardianLinkAction(INSTITUTION_ID, LINK_ID, "reject");

    expect(result).toEqual({ error: "La solicitud de vinculación ya fue resuelta." });
    expect(revalidatePath).not.toHaveBeenCalled();
  });
});
