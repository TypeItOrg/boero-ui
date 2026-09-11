"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { getFieldErrors } from "@common/utils/form-field-errors.util";
import { INSTITUTIONAL_AUTH_ERROR_MESSAGES } from "@features/institutional-auth/constants/error-messages.constants";
import { RECENT_AUTH_REQUIRED } from "@features/institutional-auth/constants/passkey.constants";
import { renamePasskey } from "@features/institutional-auth/services/rename-passkey.service";
import { revokePasskey } from "@features/institutional-auth/services/revoke-passkey.service";
import { reAuthenticate } from "@features/institutional-auth/services/re-authenticate.service";
import { passkeyLabelSchema } from "@features/institutional-auth/schemas/passkey-label.schema";
import type { RenamePasskeyState } from "@features/institutional-auth/types/rename-passkey-state.types";
import type { RevokePasskeyState } from "@features/institutional-auth/types/revoke-passkey-state.types";
import type { ReAuthenticateState } from "@features/institutional-auth/types/re-authenticate-state.types";

const LABEL_FIELD_NAMES = ["label"] as const;
const idSchema = z.object({ id: z.string().min(1) });

export async function renamePasskeyAction(id: string, _previousState: RenamePasskeyState, formData: FormData): Promise<RenamePasskeyState> {
  const bound = idSchema.safeParse({ id });

  if (!bound.success) {
    return { error: "La passkey especificada no existe." };
  }

  const parsed = passkeyLabelSchema.safeParse({ label: formData.get("label") ?? "" });

  if (!parsed.success) {
    return { fieldErrors: getFieldErrors(parsed.error.issues, LABEL_FIELD_NAMES) };
  }

  try {
    await renamePasskey(bound.data.id, parsed.data.label);
  } catch {
    return { error: "No se pudo renombrar la passkey." };
  }

  revalidatePath("/account/passkeys");
  return { success: true };
}

export async function revokePasskeyAction(id: string): Promise<RevokePasskeyState> {
  const bound = idSchema.safeParse({ id });

  if (!bound.success) {
    return { error: "La passkey especificada no existe." };
  }

  try {
    await revokePasskey(bound.data.id);
  } catch (error) {
    if (error instanceof Error && error.message === RECENT_AUTH_REQUIRED) {
      return { error: RECENT_AUTH_REQUIRED };
    }

    return { error: "No se pudo eliminar la passkey." };
  }

  revalidatePath("/account/passkeys");
  return { success: true };
}

export async function reAuthenticateAction(_previousState: ReAuthenticateState, formData: FormData): Promise<ReAuthenticateState> {
  const password = formData.get("password") ?? "";

  if (typeof password !== "string" || password.length === 0) {
    return { fieldErrors: { password: "La contraseña es requerida." } };
  }

  try {
    await reAuthenticate(password);
  } catch (error) {
    if (error instanceof Error && error.message) {
      return { error: error.message };
    }
    return { error: INSTITUTIONAL_AUTH_ERROR_MESSAGES.REAUTH_INVALID_PASSWORD };
  }

  return { success: true };
}
