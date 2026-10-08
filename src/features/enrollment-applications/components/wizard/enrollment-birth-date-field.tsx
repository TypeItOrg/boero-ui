"use client";

import type { ReactElement } from "react";

import { format, isValid } from "date-fns";

import { ReturnToLink } from "@common/components/navigation/return-to-link";
import { Badge } from "@common/components/ui/badge";
import { Field, FieldDescription, FieldError, FieldLabel } from "@common/components/ui/field";
import { Input } from "@common/components/ui/input";

import { READ_ONLY_INPUT_CLASS_NAME } from "@features/enrollment-applications/constants/enrollment-read-only-input.constants";

export function EnrollmentBirthDateField({
  birthDateError,
  calculatedAge,
  isMinor,
  birthDate,
  birthDateRequiresProfileUpdate,
}: {
  birthDateError: string | undefined;
  calculatedAge: number | null;
  isMinor: boolean;
  birthDate: Date | undefined;
  birthDateRequiresProfileUpdate: boolean;
}): ReactElement {
  return (
    <Field data-invalid={!!birthDateError}>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <FieldLabel htmlFor="birthDate" required>
          Fecha de nacimiento
        </FieldLabel>
        {calculatedAge !== null && (
          <Badge variant={isMinor ? "destructive" : "outline"} size="lg" className="w-full justify-center sm:w-auto">
            {calculatedAge} años {isMinor ? "(Menor de 18)" : "(Mayor de edad)"}
          </Badge>
        )}
      </div>
      <Input
        id="birthDate"
        value={birthDate && isValid(birthDate) ? format(birthDate, "dd/MM/yyyy") : ""}
        readOnly
        className={READ_ONLY_INPUT_CLASS_NAME}
        placeholder="dd/mm/aaaa"
        aria-invalid={!!birthDateError}
        aria-describedby={
          [birthDateRequiresProfileUpdate ? "birthDate-account-help" : undefined, birthDateError ? "birthDate-error" : undefined]
            .filter(Boolean)
            .join(" ") || undefined
        }
      />
      {birthDateRequiresProfileUpdate && (
        <FieldDescription id="birthDate-account-help">
          <ReturnToLink id="birthDate-account-link" href="/account/edit" className="underline underline-offset-4">
            Completar fecha de nacimiento en Cuenta
          </ReturnToLink>
        </FieldDescription>
      )}
      {isMinor && (
        <FieldDescription className="text-xs text-amber-600 dark:text-amber-400">
          Al ser menor de 18 años, deberás completar los datos del tutor en el paso 4.
        </FieldDescription>
      )}
      <FieldError id="birthDate-error" errors={[{ message: birthDateError }]} />
    </Field>
  );
}
