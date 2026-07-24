"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { Alert, AlertDescription, AlertTitle } from "@common/components/ui/alert";
import { Button } from "@common/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@common/components/ui/card";
import { DatePicker } from "@common/components/ui/date-picker";
import { Field, FieldContent, FieldError, FieldGroup, FieldLabel } from "@common/components/ui/field";
import { Input } from "@common/components/ui/input";
import { updateInstitutionalProfileAction } from "@features/institutional-auth/actions/update-institutional-profile.action";
import type { InstitutionalPerson } from "@features/institutional-auth/types/institutional-person.types";
import { CityDropdown, CountryDropdown } from "@features/locations/components/location-dropdowns";
import {
  formatBirthDateInput,
  getLatestAllowedBirthDate,
  parseBirthDateInput,
} from "@features/people/utils/person-birth-date.util";

type InstitutionalProfileProps = {
  person: InstitutionalPerson;
};

type InstitutionalProfileFormProps = InstitutionalProfileProps & {
  returnTo?: string;
};

export function InstitutionalProfile({ person }: InstitutionalProfileProps): React.ReactElement {
  return <ProfileSummary person={person} />;
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
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
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

function ProfileSummary({ person }: { person: InstitutionalPerson }): React.ReactElement {
  return (
    <div className="flex flex-col gap-5">
      <Card className="bg-muted/25 p-5 sm:p-6">
        <CardHeader className="p-0">
          <CardTitle>
            {person.firstName} {person.lastName}
          </CardTitle>
          <CardDescription>Información personal de tu cuenta institucional.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <dl className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <ProfileValue label="Documento" value={person.documentNumber} />
            <ProfileValue label="Fecha de nacimiento" value={formatDate(person.birthDate)} />
            <ProfileValue label="Email" value={person.email} />
            <ProfileValue label="Teléfono" value={person.phoneNumber} />
            <ProfileValue label="Nacionalidad" value={person.nationalityCountry?.name} />
            <ProfileValue label="Ciudad natal" value={person.birthCity?.name} />
          </dl>
        </CardContent>
      </Card>
      <Card className="bg-muted/25 p-5 sm:p-6">
        <CardHeader className="p-0">
          <CardTitle>Domicilio</CardTitle>
          <CardDescription>Dirección registrada en tu institución.</CardDescription>
        </CardHeader>
        <CardContent className="mt-5 p-0">
          <dl className="grid gap-5 sm:grid-cols-2">
            <ProfileValue label="Dirección" value={formatAddress(person)} />
            <ProfileValue label="Barrio" value={person.address?.neighborhood} />
            <ProfileValue label="Información adicional" value={person.address?.additionalInfo} />
          </dl>
        </CardContent>
      </Card>
    </div>
  );
}

function TextField({
  id,
  name,
  label,
  description,
  error,
  className,
  ...props
}: React.ComponentProps<typeof Input> & { label: string; description?: string; error?: string }): React.ReactElement {
  return (
    <Field
      className={className ?? "flex-[1_0_min(240px,100%)]"}
      data-disabled={props.disabled}
      data-invalid={Boolean(error)}
    >
      <FieldContent>
        <FieldLabel htmlFor={id} required={props.required}>
          {label}
        </FieldLabel>
        {description ? <p className="text-muted-foreground text-xs">{description}</p> : null}
      </FieldContent>
      <Input id={id} name={name} aria-invalid={Boolean(error)} {...props} />
      <FieldError>{error}</FieldError>
    </Field>
  );
}

function DropdownField({
  id,
  label,
  error,
  required,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
}): React.ReactElement {
  return (
    <Field className="flex-[1_0_min(240px,100%)]" data-invalid={Boolean(error)}>
      <FieldContent>
        <FieldLabel htmlFor={id} required={required}>
          {label}
        </FieldLabel>
      </FieldContent>
      {children}
      <FieldError>{error}</FieldError>
    </Field>
  );
}

function DateField({
  id,
  label,
  name,
  onChange,
  error,
  required,
  value,
}: {
  id: string;
  label: string;
  name: string;
  onChange: (date: Date | undefined) => void;
  error?: string;
  required?: boolean;
  value?: Date;
}): React.ReactElement {
  return (
    <Field className="flex-[1_0_min(240px,100%)]" data-invalid={Boolean(error)}>
      <FieldContent>
        <FieldLabel htmlFor={id} required={required}>
          {label}
        </FieldLabel>
      </FieldContent>
      <input type="hidden" name={name} value={formatBirthDateInput(value)} />
      <DatePicker
        id={id}
        value={value}
        onChange={onChange}
        maxDate={getLatestAllowedBirthDate()}
        aria-invalid={Boolean(error)}
      />
      <FieldError>{error}</FieldError>
    </Field>
  );
}

function ProfileValue({ label, value }: { label: string; value?: string | null }): React.ReactElement {
  return (
    <div>
      <dt className="text-muted-foreground text-xs font-medium tracking-wider uppercase">{label}</dt>
      <dd className="mt-1 text-sm font-medium">{value || "—"}</dd>
    </div>
  );
}

function formatDate(value: string | null): string {
  if (!value) return "—";
  const [year, month, day] = value.split("-");
  return year && month && day ? `${day}/${month}/${year}` : value;
}

function formatAddress(person: InstitutionalPerson): string {
  const address = person.address;
  if (!address) return "—";
  return [
    address.street,
    address.number,
    address.floor && `Piso ${address.floor}`,
    address.apartment && `Depto. ${address.apartment}`,
    address.city?.name,
  ]
    .filter(Boolean)
    .join(", ");
}

function getFormError(error: string | undefined, fieldErrors: Record<string, string> | undefined): string | undefined {
  if (error) return error;
  if (fieldErrors && Object.keys(fieldErrors).length > 0) return undefined;
  return "Revisá los datos ingresados.";
}
