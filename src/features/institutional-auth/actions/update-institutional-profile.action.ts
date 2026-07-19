"use server";

import { revalidatePath } from "next/cache";

import { getResponseErrorActionState, getValidationActionState } from "@common/utils/action-state.util";
import { institutionalApiFetch } from "@features/institutional-auth/services/institutional-api-fetch.service";
import { institutionalProfileSchema } from "@features/institutional-auth/schemas/institutional-profile.schema";

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
  };

  const parsed = institutionalProfileSchema.safeParse(payload);
  if (!parsed.success) return getValidationActionState(parsed.error.issues, PROFILE_FIELDS);

  const response = institutionalApiFetch("/api/v1/person/me", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(parsed.data),
  });
  const errorState = await getResponseErrorActionState(
    response,
    PROFILE_FIELDS,
    "No se pudieron actualizar tus datos.",
  );
  if (errorState) return errorState;

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
  "address",
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
