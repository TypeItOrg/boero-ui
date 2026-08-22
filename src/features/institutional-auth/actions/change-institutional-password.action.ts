"use server";

import { revalidatePath } from "next/cache";

import { getResponseErrorActionState, getValidationActionState } from "@common/utils/action-state.util";
import { institutionalPasswordSchema } from "@features/institutional-auth/schemas/institutional-password.schema";
import { logoutInstitutional } from "@features/institutional-auth/actions/institutional-logout.action";
import { institutionalApiFetch } from "@features/institutional-auth/services/institutional-api-fetch.service";
import { fetchInstitutionalPerson } from "@features/institutional-auth/services/fetch-institutional-person.service";
import { requireInstitutionalUser } from "@features/institutional-auth/services/get-institutional-user.service";
import type { InstitutionalPasswordActionState } from "@features/institutional-auth/types/institutional-password-state.types";
import type { InstitutionalPerson } from "@features/institutional-auth/types/institutional-person.types";
import { setInstitutionalPasswordChangedCookie } from "@features/institutional-auth/utils/institutional-auth-cookies.util";

const PASSWORD_FIELDS = ["currentPassword", "password", "confirmPassword"] as const;
const FALLBACK_ERROR = "No se pudo cambiar tu contraseña.";

export async function changeInstitutionalPasswordAction(
  _prevState: InstitutionalPasswordActionState,
  formData: FormData,
): Promise<InstitutionalPasswordActionState> {
  const parsed = institutionalPasswordSchema.safeParse({
    currentPassword: formData.get("currentPassword") ?? "",
    password: formData.get("password") ?? "",
    confirmPassword: formData.get("confirmPassword") ?? "",
  });

  if (!parsed.success) return getValidationActionState(parsed.error.issues, PASSWORD_FIELDS);

  await requireInstitutionalUser();

  const person = await fetchInstitutionalPerson();
  if (!person) return { error: "No se pudieron obtener tus datos personales." };
  if (!person.birthDate) return { error: "Tu perfil no tiene fecha de nacimiento; completala antes de cambiar la contraseña." };

  const response = institutionalApiFetch("/api/v1/person/me", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(buildRequestBody(person, parsed.data)),
  });
  const errorState = await getResponseErrorActionState(response, PASSWORD_FIELDS, FALLBACK_ERROR);
  if (errorState) return errorState;

  await setInstitutionalPasswordChangedCookie();

  revalidatePath("/account");
  await logoutInstitutional();
  return { success: true };
}

function buildRequestBody(person: InstitutionalPerson, values: { currentPassword: string; password: string }): Record<string, unknown> {
  return {
    firstName: person.firstName,
    lastName: person.lastName,
    birthDate: person.birthDate,
    email: person.email ?? "",
    phoneNumber: person.phoneNumber ?? "",
    birthCityId: person.birthCity?.id,
    nationalityCountryId: person.nationalityCountry?.id,
    address: person.address
      ? {
          cityId: person.address.city?.id ?? "",
          street: person.address.street,
          number: person.address.number ?? "",
          floor: person.address.floor ?? "",
          apartment: person.address.apartment ?? "",
          neighborhood: person.address.neighborhood ?? "",
          additionalInfo: person.address.additionalInfo ?? "",
        }
      : undefined,
    currentPassword: values.currentPassword,
    password: values.password,
  };
}
