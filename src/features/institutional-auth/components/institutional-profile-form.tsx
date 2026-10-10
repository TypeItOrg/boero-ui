"use client";

import { useActionState, useState, type ReactElement } from "react";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { CircleAlertIcon, UserRoundIcon } from "lucide-react";

import { ActionForm } from "@common/components/action-form";
import { SectionHeader } from "@common/components/section-header";
import { Alert, AlertDescription, AlertTitle } from "@common/components/ui/alert";
import { Button } from "@common/components/ui/button";
import { FieldGroup } from "@common/components/ui/field";

import { updateInstitutionalProfileAction } from "@features/institutional-auth/actions/update-institutional-profile.action";
import { DateField, TextField } from "@features/institutional-auth/components/institutional-profile-fields";
import { InstitutionalProfileLocationSection } from "@features/institutional-auth/components/institutional-profile-location-section";
import type { InstitutionalPerson } from "@features/institutional-auth/types/institutional-person.types";
import { parseBirthDateInput } from "@features/people/utils/person-birth-date.util";

type InstitutionalProfileFormProps = {
  person: InstitutionalPerson;
  returnTo?: string;
};

export function InstitutionalProfileForm(props: InstitutionalProfileFormProps): ReactElement {
  return <InstitutionalProfileFormView key={`${props.person.institutionId}:${props.person.personId}`} {...props} />;
}

function InstitutionalProfileFormView({ person, returnTo = "/account" }: InstitutionalProfileFormProps): ReactElement {
  const router = useRouter();

  const [state, formAction, isPending] = useActionState(
    async (_previous: Awaited<ReturnType<typeof updateInstitutionalProfileAction>>, formData: FormData) => {
      const result = await updateInstitutionalProfileAction(formData);

      if (result.success) {
        router.replace(returnTo);
      }

      return result;
    },
    {},
  );

  const fieldErrors = "fieldErrors" in state ? (state.fieldErrors ?? {}) : {};

  const error = getFormError("error" in state ? state.error : undefined, "fieldErrors" in state ? state.fieldErrors : undefined);

  const [birthDate, setBirthDate] = useState<Date | undefined>(() => parseBirthDateInput(person.birthDate));

  const [addressCityId, setAddressCityId] = useState(person.address?.city?.id ?? "");

  const [addressStreet, setAddressStreet] = useState(person.address?.street ?? "");

  const hasAddress = Boolean(addressCityId || addressStreet.trim());

  return (
    <ActionForm action={formAction} className="flex h-full flex-1 flex-col gap-4">
      {error ? (
        <Alert variant="destructive">
          <CircleAlertIcon className="size-4" />
          <AlertTitle>¡Ups! No se pudieron guardar los cambios</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}
      <div className="bg-muted/25 rounded-xl border p-4 sm:p-5">
        <header className="-mx-4 border-b px-4 pb-4 sm:-mx-5 sm:px-5 sm:pb-5">
          <SectionHeader
            icon={UserRoundIcon}
            title="Datos personales"
            description="Actualizá la información con la que te identifica tu institución."
          />
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

      <div className="mt-auto flex flex-row flex-wrap justify-end gap-3">
        <Button asChild variant="outline" size="lg" className="flex-1 sm:flex-none">
          <Link href={returnTo}>Cancelar</Link>
        </Button>
        <Button type="submit" size="lg" className="flex-1 sm:flex-none" disabled={isPending}>
          {isPending ? "Guardando..." : "Guardar cambios"}
        </Button>
      </div>
    </ActionForm>
  );
}

function getFormError(error: string | undefined, fieldErrors: Record<string, string> | undefined): string | undefined {
  if (fieldErrors && Object.keys(fieldErrors).length > 0) {
    return undefined;
  }

  if (error) {
    return error;
  }

  return undefined;
}
