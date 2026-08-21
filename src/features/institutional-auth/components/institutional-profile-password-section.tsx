import * as React from "react";
import { KeyRoundIcon } from "lucide-react";

import { Field, FieldContent, FieldError, FieldGroup, FieldLabel } from "@common/components/ui/field";
import { PasswordInput } from "@common/components/ui/password-input";

type PasswordSectionProps = {
  fieldErrors: Record<string, string>;
};

export function InstitutionalProfilePasswordSection({ fieldErrors }: PasswordSectionProps): React.ReactElement {
  return (
    <div className="bg-muted/25 rounded-xl border p-4 sm:p-5">
      <header className="-mx-4 border-b px-4 pb-4 sm:-mx-5 sm:px-5 sm:pb-5">
        <div className="flex items-center gap-3.5">
          <div className="bg-primary/10 text-primary flex aspect-square min-h-11 min-w-11 shrink-0 items-center justify-center self-stretch rounded-xl">
            <KeyRoundIcon className="size-5" aria-hidden="true" />
          </div>
          <div>
            <h2 className="text-base font-semibold">Cambiar contraseña</h2>
            <p className="text-muted-foreground text-sm">Dejá los campos en blanco para conservar la contraseña actual.</p>
          </div>
        </div>
      </header>
      <div className="mt-4 sm:mt-5">
        <FieldGroup className="flex flex-row flex-wrap items-start gap-4">
          <Field data-invalid={!!fieldErrors.currentPassword} className="basis-full">
            <FieldContent>
              <FieldLabel htmlFor="profile-current-password">Contraseña actual</FieldLabel>
            </FieldContent>
            <PasswordInput
              id="profile-current-password"
              name="currentPassword"
              aria-invalid={!!fieldErrors.currentPassword}
              autoComplete="current-password"
            />
            <FieldError>{fieldErrors.currentPassword}</FieldError>
          </Field>

          <Field data-invalid={!!fieldErrors.password} className="flex-[1_0_min(200px,100%)]">
            <FieldContent>
              <FieldLabel htmlFor="profile-password">Nueva contraseña</FieldLabel>
            </FieldContent>
            <PasswordInput id="profile-password" name="password" aria-invalid={!!fieldErrors.password} autoComplete="new-password" />
            <FieldError>{fieldErrors.password}</FieldError>
          </Field>

          <Field data-invalid={!!fieldErrors.confirmPassword} className="flex-[1_0_min(200px,100%)]">
            <FieldContent>
              <FieldLabel htmlFor="profile-confirm-password">Confirmar nueva contraseña</FieldLabel>
            </FieldContent>
            <PasswordInput
              id="profile-confirm-password"
              name="confirmPassword"
              aria-invalid={!!fieldErrors.confirmPassword}
              autoComplete="new-password"
            />
            <FieldError>{fieldErrors.confirmPassword}</FieldError>
          </Field>
        </FieldGroup>
      </div>
    </div>
  );
}
