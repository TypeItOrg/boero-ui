jest.mock("next/cache", () => ({
  revalidatePath: jest.fn(),
}));

jest.mock("@features/people/services/people-api-fetch.service", () => ({
  peopleApiFetch: jest.fn(),
}));

jest.mock("@features/people/services/fetch-person-roles.service", () => ({
  fetchPersonRoles: jest.fn(),
}));

jest.mock("@features/platform-auth/services/get-platform-account.service", () => ({
  requirePlatformAccount: jest.fn().mockResolvedValue({ platformAccountId: "account-1" }),
}));

import { revalidatePath } from "next/cache";

import { updatePlatformPersonAction } from "@features/people/actions/update-person.action";
import { peopleApiFetch } from "@features/people/services/people-api-fetch.service";

const INSTITUTION_ID = "inst-1";
const PERSON_ID = "person-1";

describe("updatePersonAction", () => {
  const peopleApiFetchMock = jest.mocked(peopleApiFetch);
  const revalidatePathMock = jest.mocked(revalidatePath);

  beforeEach(() => {
    peopleApiFetchMock.mockReset();
    revalidatePathMock.mockReset();
  });

  it("omits the password when fields are empty", async () => {
    peopleApiFetchMock.mockResolvedValue(new Response(null, { status: 200 }));

    const result = await updatePlatformPersonAction(INSTITUTION_ID, PERSON_ID, createFormData());

    expect(result).toEqual({ success: true });
    const [, , request] = peopleApiFetchMock.mock.calls[0];
    expect(JSON.parse(request?.body as string)).toEqual({
      firstName: "María",
      lastName: "González",
      email: "maria@boero.edu.ar",
      phoneNumber: "",
    });
    expect(revalidatePathMock).toHaveBeenCalledWith(`/admin/institutions/${INSTITUTION_ID}/people`);
  });

  it("includes the new password when provided with matching confirmation", async () => {
    peopleApiFetchMock.mockResolvedValue(new Response(null, { status: 200 }));

    const result = await updatePlatformPersonAction(
      INSTITUTION_ID,
      PERSON_ID,
      createFormData({ password: "nueva-contraseña", confirmPassword: "nueva-contraseña" }),
    );

    expect(result).toEqual({ success: true });
    const [, , request] = peopleApiFetchMock.mock.calls[0];
    expect(JSON.parse(request?.body as string)).toEqual({
      firstName: "María",
      lastName: "González",
      email: "maria@boero.edu.ar",
      phoneNumber: "",
      password: "nueva-contraseña",
    });
  });

  it("returns validation error when passwords do not match", async () => {
    const result = await updatePlatformPersonAction(
      INSTITUTION_ID,
      PERSON_ID,
      createFormData({ password: "nueva-contraseña", confirmPassword: "diferente-contraseña" }),
    );

    expect(result.fieldErrors).toEqual({
      confirmPassword: "Las contraseñas no coinciden.",
    });
    expect(peopleApiFetchMock).not.toHaveBeenCalled();
  });
});

function createFormData(
  overrides: Partial<
    Record<"firstName" | "lastName" | "email" | "phoneNumber" | "password" | "confirmPassword", string>
  > = {},
): FormData {
  const values = {
    firstName: "María",
    lastName: "González",
    email: "maria@boero.edu.ar",
    phoneNumber: "",
    password: "",
    confirmPassword: "",
    ...overrides,
  };

  const formData = new FormData();
  Object.entries(values).forEach(([field, value]) => formData.set(field, value));
  return formData;
}
