"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { KeyRoundIcon, MapPinIcon, UserRoundIcon } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@common/components/ui/alert";
import { Button } from "@common/components/ui/button";
import { Field, FieldContent, FieldError, FieldGroup, FieldLabel } from "@common/components/ui/field";
import { PasswordInput } from "@common/components/ui/password-input";
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
    <form onSubmit={handleSubmit} className="flex h-full flex-1 flex-col gap-4">
      {error ? (
        <Alert variant="destructive">
          <AlertTitle>No se pudieron guardar los cambios</AlertTitle>
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
              <p className="text-muted-foreground text-sm">
                Actualizá la información con la que te identifica tu institución.
              </p>
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
        </div>
      </div>

      <div className="bg-muted/25 rounded-xl border p-4 sm:p-5">
        <header className="-mx-4 border-b px-4 pb-4 sm:-mx-5 sm:px-5 sm:pb-5">
          <div className="flex items-center gap-3.5">
            <div className="bg-primary/10 text-primary flex aspect-square min-h-11 min-w-11 shrink-0 items-center justify-center self-stretch rounded-xl">
              <MapPinIcon className="size-5" aria-hidden="true" />
            </div>
            <div>
              <h2 className="text-base font-semibold">Ubicación</h2>
              <p className="text-muted-foreground text-sm">
                Completá tu nacionalidad, ciudad de nacimiento y domicilio.
              </p>
            </div>
          </div>
        </header>
        <div className="mt-4 sm:mt-5">
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
        </div>
      </div>

      <div className="bg-muted/25 rounded-xl border p-4 sm:p-5">
        <header className="-mx-4 border-b px-4 pb-4 sm:-mx-5 sm:px-5 sm:pb-5">
          <div className="flex items-center gap-3.5">
            <div className="bg-primary/10 text-primary flex aspect-square min-h-11 min-w-11 shrink-0 items-center justify-center self-stretch rounded-xl">
              <KeyRoundIcon className="size-5" aria-hidden="true" />
            </div>
            <div>
              <h2 className="text-base font-semibold">Cambiar contraseña</h2>
              <p className="text-muted-foreground text-sm">
                Dejá los campos en blanco para conservar la contraseña actual.
              </p>
            </div>
          </div>
        </header>
        <div className="mt-4 sm:mt-5">
          <FieldGroup className="flex flex-row flex-wrap items-start gap-4">
            <Field data-invalid={!!fieldErrors.password} className="flex-[1_0_min(200px,100%)]">
              <FieldContent>
                <FieldLabel htmlFor="profile-password">Nueva contraseña</FieldLabel>
              </FieldContent>
              <PasswordInput
                id="profile-password"
                name="password"
                aria-invalid={!!fieldErrors.password}
                autoComplete="new-password"
              />
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
  if (error) return error;
  if (fieldErrors && Object.keys(fieldErrors).length > 0) return undefined;
  return "Revisá los datos ingresados.";
}
