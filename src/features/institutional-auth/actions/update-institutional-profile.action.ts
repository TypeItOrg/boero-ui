"use server";

import { revalidatePath } from "next/cache";

import { getResponseErrorActionState, getValidationActionState } from "@common/utils/action-state.util";
import { institutionalApiFetch } from "@features/institutional-auth/services/institutional-api-fetch.service";
import { institutionalProfileSchema } from "@features/institutional-auth/schemas/institutional-profile.schema";
import { requireInstitutionalUser } from "@features/institutional-auth/services/get-institutional-user.service";
import { setInstitutionalPasswordChangedCookie } from "@features/institutional-auth/utils/institutional-auth-cookies.util";

export async function updateInstitutionalProfileAction(formData: FormData) {
  const payload = {
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    birthDate: formData.get("birthDate"),
    email: formData.get("email") || "",
    phoneNumber: formData.get("phoneNumber") || "",
    birthCityId: formData.get("birthCityId") || undefined,
    nationalityCountryId: formData.get("nationalityCountryId") || undefined,
    address: parseAddress(formData),
    currentPassword: formData.get("currentPassword") || "",
    password: formData.get("password") || "",
    confirmPassword: formData.get("confirmPassword") || "",
  };

  const parsed = institutionalProfileSchema.safeParse(payload);
  if (!parsed.success) return getValidationActionState(parsed.error.issues, PROFILE_FIELDS);

  await requireInstitutionalUser();

  const requestBody: Record<string, unknown> = {
    firstName: parsed.data.firstName,
    lastName: parsed.data.lastName,
    birthDate: parsed.data.birthDate,
    email: parsed.data.email,
    phoneNumber: parsed.data.phoneNumber,
    birthCityId: parsed.data.birthCityId,
    nationalityCountryId: parsed.data.nationalityCountryId,
    address: parsed.data.address,
  };

  if (parsed.data.password) {
    requestBody.currentPassword = parsed.data.currentPassword;
    requestBody.password = parsed.data.password;
  }

  const response = institutionalApiFetch("/api/v1/person/me", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(requestBody),
  });
  const errorState = await getResponseErrorActionState(
    response,
    PROFILE_FIELDS,
    "No se pudieron actualizar tus datos.",
  );
  if (errorState) return errorState;

  if (parsed.data.password) await setInstitutionalPasswordChangedCookie();

  revalidatePath("/");
  revalidatePath("/profile");
  return { success: true } as const;
}

const PROFILE_FIELDS = [
  "firstName",
  "lastName",
  "birthDate",
  "email",
  "phoneNumber",
  "birthCityId",
  "nationalityCountryId",
  "address.cityId",
  "address.street",
  "address.number",
  "address.floor",
  "address.apartment",
  "address.neighborhood",
  "address.additionalInfo",
  "currentPassword",
  "password",
  "confirmPassword",
] as const;

function parseAddress(formData: FormData) {
  const cityId = String(formData.get("address.cityId") ?? "");
  const street = String(formData.get("address.street") ?? "");
  if (!cityId && !street) return undefined;

  return {
    cityId,
    street,
    number: String(formData.get("address.number") ?? ""),
    floor: String(formData.get("address.floor") ?? ""),
    apartment: String(formData.get("address.apartment") ?? ""),
    neighborhood: String(formData.get("address.neighborhood") ?? ""),
    additionalInfo: String(formData.get("address.additionalInfo") ?? ""),
  };
}
