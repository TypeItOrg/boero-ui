"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CircleAlertIcon, UserRoundIcon } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@common/components/ui/alert";
import { Button } from "@common/components/ui/button";
import { FieldGroup } from "@common/components/ui/field";
import { logoutInstitutional } from "@features/institutional-auth/actions/institutional-logout.action";
import { updateInstitutionalProfileAction } from "@features/institutional-auth/actions/update-institutional-profile.action";
import { DateField, TextField } from "@features/institutional-auth/components/institutional-profile-fields";
import { InstitutionalProfileLocationSection } from "@features/institutional-auth/components/institutional-profile-location-section";
import { InstitutionalProfilePasswordSection } from "@features/institutional-auth/components/institutional-profile-password-section";
import type { InstitutionalPerson } from "@features/institutional-auth/types/institutional-person.types";
import { parseBirthDateInput } from "@features/people/utils/person-birth-date.util";

type InstitutionalProfileFormProps = {
  person: InstitutionalPerson;
  returnTo?: string;
};

export function InstitutionalProfileForm({ person, returnTo = "/profile" }: InstitutionalProfileFormProps): React.ReactElement {
  const router = useRouter();
  const [isPending, startTransition] = React.useTransition();
  const [error, setError] = React.useState<string>();
  const [fieldErrors, setFieldErrors] = React.useState<Record<string, string>>({});
  const [birthDate, setBirthDate] = React.useState<Date | undefined>(() => parseBirthDateInput(person.birthDate));
  const [addressCityId, setAddressCityId] = React.useState(person.address?.city?.id ?? "");
  const [addressStreet, setAddressStreet] = React.useState(person.address?.street ?? "");
  const hasAddress = Boolean(addressCityId || addressStreet.trim());

  function handleSubmit(event: React.FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    setError(undefined);
    setFieldErrors({});
    const formData = new FormData(event.currentTarget);
    const passwordChanged = String(formData.get("password") ?? "") !== "";
    startTransition(async () => {
      const result = await updateInstitutionalProfileAction(formData);
      if (result.success) {
        if (passwordChanged) {
          await logoutInstitutional();
          return;
        }

        router.replace(returnTo);
        return;
      }
      const nextFieldErrors = "fieldErrors" in result ? result.fieldErrors : undefined;
      setFieldErrors(nextFieldErrors ?? {});
      setError(getFormError(result.error, nextFieldErrors));
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex h-full flex-1 flex-col gap-4">
      {error ? (
        <Alert variant="destructive">
          <CircleAlertIcon className="size-4" />
          <AlertTitle>¡Ups! No se pudieron guardar los cambios</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}
      <div className="bg-muted/25 rounded-xl border p-4 sm:p-5">
        <header className="-mx-4 border-b px-4 pb-4 sm:-mx-5 sm:px-5 sm:pb-5">
          <div className="flex items-center gap-3.5">
            <div className="bg-primary/10 text-primary flex aspect-square min-h-11 min-w-11 shrink-0 items-center justify-center self-stretch rounded-xl">
              <UserRoundIcon className="size-5" aria-hidden="true" />
            </div>
            <div>
              <h2 className="text-base font-semibold">Datos personales</h2>
              <p className="text-muted-foreground text-sm">Actualizá la información con la que te identifica tu institución.</p>
            </div>
          </div>
        </header>
        <div className="mt-4 sm:mt-5">
          <FieldGroup className="flex flex-row flex-wrap items-start gap-4">
            <TextField
              id="profile-first-name"
              name="firstName"
              label="Nombre"
              defaultValue={person.firstName}
              error={fieldErrors.firstName}
              required
            />
            <TextField id="profile-last-name" name="lastName" label="Apellido" defaultValue={person.lastName} error={fieldErrors.lastName} required />
            <TextField id="profile-document" label="Documento" value={person.documentNumber} disabled />
            <DateField
              id="profile-birth-date"
              name="birthDate"
              label="Fecha de nacimiento"
              value={birthDate}
              onChange={setBirthDate}
              error={fieldErrors.birthDate}
              required
            />
          </FieldGroup>
          <FieldGroup className="mt-4 flex flex-row flex-wrap items-start gap-4">
            <TextField id="profile-email" name="email" label="Email" type="email" defaultValue={person.email ?? ""} error={fieldErrors.email} />
            <TextField
              id="profile-phone"
              name="phoneNumber"
              label="Teléfono"
              defaultValue={person.phoneNumber ?? ""}
              error={fieldErrors.phoneNumber}
            />
          </FieldGroup>
        </div>
      </div>

      <InstitutionalProfileLocationSection
        fieldErrors={fieldErrors}
        hasAddress={hasAddress}
        person={person}
        onAddressCityChange={(value) => setAddressCityId(value ?? "")}
        onAddressStreetChange={setAddressStreet}
      />

      <InstitutionalProfilePasswordSection fieldErrors={fieldErrors} />

      <div className="mt-auto flex flex-row flex-wrap justify-end gap-3">
        <Button asChild variant="outline" size="lg" className="flex-1 sm:flex-none">
          <Link href={returnTo}>Cancelar</Link>
        </Button>
        <Button type="submit" size="lg" className="flex-1 sm:flex-none" disabled={isPending}>
          {isPending ? "Guardando..." : "Guardar cambios"}
        </Button>
      </div>
    </form>
  );
}

function getFormError(error: string | undefined, fieldErrors: Record<string, string> | undefined): string | undefined {
  if (fieldErrors && Object.keys(fieldErrors).length > 0) return undefined;
  if (error) return error;
  return "Revisá los datos ingresados.";
}
