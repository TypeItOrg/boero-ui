"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { Alert, AlertDescription, AlertTitle } from "@common/components/ui/alert";
import { Button } from "@common/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@common/components/ui/card";
import { FieldGroup } from "@common/components/ui/field";
import { updateInstitutionalProfileAction } from "@features/institutional-auth/actions/update-institutional-profile.action";
import {
  DateField,
  DropdownField,
  TextField,
} from "@features/institutional-auth/components/institutional-profile-fields";
import { InstitutionalProfileSummary } from "@features/institutional-auth/components/institutional-profile-summary";
import type { InstitutionalPerson } from "@features/institutional-auth/types/institutional-person.types";
import { CityDropdown, CountryDropdown } from "@features/locations/components/location-dropdowns";
import { parseBirthDateInput } from "@features/people/utils/person-birth-date.util";

type InstitutionalProfileProps = {
  person: InstitutionalPerson;
};

type InstitutionalProfileFormProps = InstitutionalProfileProps & {
  returnTo?: string;
};

export function InstitutionalProfile({ person }: InstitutionalProfileProps): React.ReactElement {
  return <InstitutionalProfileSummary person={person} />;
}

export function InstitutionalProfileForm({
  person,
  returnTo = "/profile",
}: InstitutionalProfileFormProps): React.ReactElement {
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
    startTransition(async () => {
      const result = await updateInstitutionalProfileAction(formData);
      if (result.success) {
        router.replace(returnTo);
        return;
      }
      const nextFieldErrors = "fieldErrors" in result ? result.fieldErrors : undefined;
      setFieldErrors(nextFieldErrors ?? {});
      setError(getFormError(result.error, nextFieldErrors));
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {error ? (
        <Alert variant="destructive">
          <AlertTitle>No se pudieron guardar los cambios</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}
      <Card className="bg-muted/25 p-5 sm:p-6">
        <CardHeader className="p-0">
          <CardTitle>Datos personales</CardTitle>
          <CardDescription>Actualizá la información con la que te identifica tu institución.</CardDescription>
        </CardHeader>
        <CardContent className="mt-5 p-0">
          <FieldGroup className="flex flex-row flex-wrap items-start gap-4">
            <TextField
              id="profile-first-name"
              name="firstName"
              label="Nombre"
              defaultValue={person.firstName}
              error={fieldErrors.firstName}
              required
            />
            <TextField
              id="profile-last-name"
              name="lastName"
              label="Apellido"
              defaultValue={person.lastName}
              error={fieldErrors.lastName}
              required
            />
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
            <TextField
              id="profile-email"
              name="email"
              label="Email"
              type="email"
              defaultValue={person.email ?? ""}
              error={fieldErrors.email}
            />
            <TextField
              id="profile-phone"
              name="phoneNumber"
              label="Teléfono"
              defaultValue={person.phoneNumber ?? ""}
              error={fieldErrors.phoneNumber}
            />
          </FieldGroup>
        </CardContent>
      </Card>

      <Card className="bg-muted/25 p-5 sm:p-6">
        <CardHeader className="p-0">
          <CardTitle>Ubicación</CardTitle>
          <CardDescription>Completá tu nacionalidad, ciudad de nacimiento y domicilio.</CardDescription>
        </CardHeader>
        <CardContent className="mt-5 p-0">
          <FieldGroup className="flex flex-row flex-wrap items-start gap-4">
            <DropdownField id="profile-nationality" label="Nacionalidad" error={fieldErrors.nationalityCountryId}>
              <CountryDropdown
                ariaInvalid={Boolean(fieldErrors.nationalityCountryId)}
                id="profile-nationality"
                name="nationalityCountryId"
                initialItem={
                  person.nationalityCountry
                    ? {
                        ...person.nationalityCountry,
                        isoCode: person.nationalityCountry.isoCode ?? "",
                      }
                    : undefined
                }
                optional
              />
            </DropdownField>
            <DropdownField id="profile-birth-city" label="Ciudad natal" error={fieldErrors.birthCityId}>
              <CityDropdown
                ariaInvalid={Boolean(fieldErrors.birthCityId)}
                id="profile-birth-city"
                name="birthCityId"
                initialItem={person.birthCity ?? undefined}
                optional
              />
            </DropdownField>
            <DropdownField
              id="profile-address-city"
              label="Ciudad del domicilio"
              error={fieldErrors["address.cityId"]}
              required={hasAddress}
            >
              <CityDropdown
                ariaInvalid={Boolean(fieldErrors["address.cityId"])}
                id="profile-address-city"
                name="address.cityId"
                initialItem={person.address?.city ?? undefined}
                onValueChange={(value) => setAddressCityId(value ?? "")}
                optional
              />
            </DropdownField>
            <TextField
              id="profile-address-street"
              name="address.street"
              label="Calle"
              defaultValue={person.address?.street ?? ""}
              error={fieldErrors["address.street"]}
              onChange={(event) => setAddressStreet(event.currentTarget.value)}
              required={hasAddress}
            />
            <TextField
              id="profile-address-number"
              name="address.number"
              label="Número"
              defaultValue={person.address?.number ?? ""}
              error={fieldErrors["address.number"]}
            />
            <TextField
              id="profile-address-floor"
              name="address.floor"
              label="Piso"
              defaultValue={person.address?.floor ?? ""}
              error={fieldErrors["address.floor"]}
            />
            <TextField
              id="profile-address-apartment"
              name="address.apartment"
              label="Departamento"
              defaultValue={person.address?.apartment ?? ""}
              error={fieldErrors["address.apartment"]}
            />
            <TextField
              id="profile-address-neighborhood"
              name="address.neighborhood"
              label="Barrio"
              defaultValue={person.address?.neighborhood ?? ""}
              error={fieldErrors["address.neighborhood"]}
            />
            <TextField
              id="profile-address-info"
              name="address.additionalInfo"
              label="Información adicional"
              defaultValue={person.address?.additionalInfo ?? ""}
              error={fieldErrors["address.additionalInfo"]}
            />
          </FieldGroup>
        </CardContent>
      </Card>

      <div className="flex flex-wrap justify-end gap-3">
        <Button asChild variant="outline" size="lg">
          <Link href={returnTo}>Cancelar</Link>
        </Button>
        <Button type="submit" size="lg" disabled={isPending}>
          {isPending ? "Guardando..." : "Guardar cambios"}
        </Button>
      </div>
    </form>
  );
}

function getFormError(error: string | undefined, fieldErrors: Record<string, string> | undefined): string | undefined {
  if (error) return error;
  if (fieldErrors && Object.keys(fieldErrors).length > 0) return undefined;
  return "Revisá los datos ingresados.";
}
