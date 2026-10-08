"use client";

import type { ReactElement } from "react";

import { UserRoundIcon } from "lucide-react";

import { ReturnToLink } from "@common/components/navigation/return-to-link";
import { Button } from "@common/components/ui/button";
import { Card, CardContent, CardFooter } from "@common/components/ui/card";
import { Field, FieldError, FieldLabel } from "@common/components/ui/field";
import { Input } from "@common/components/ui/input";
import { NumericInput, PhoneInput } from "@common/components/ui/restricted-input";
import { TabsContent } from "@common/components/ui/tabs";

import { EnrollmentStepCardHeader } from "@features/enrollment-applications/components/enrollment-step-card-header";
import { EnrollmentBirthDateField } from "@features/enrollment-applications/components/wizard/enrollment-birth-date-field";
import { READ_ONLY_INPUT_CLASS_NAME } from "@features/enrollment-applications/constants/enrollment-read-only-input.constants";
import type { EnrollmentWizardModel } from "@features/enrollment-applications/types/enrollment-wizard-model.types";

type Props = Pick<
  EnrollmentWizardModel,
  | "getFieldError"
  | "firstName"
  | "lastName"
  | "documentNumber"
  | "birthDateError"
  | "calculatedAge"
  | "isMinor"
  | "birthDate"
  | "birthDateRequiresProfileUpdate"
  | "phoneNumber"
  | "email"
  | "handleActiveTabChange"
>;

export function EnrollmentPersonalStep({
  getFieldError,
  firstName,
  lastName,
  documentNumber,
  birthDateError,
  calculatedAge,
  isMinor,
  birthDate,
  birthDateRequiresProfileUpdate,
  phoneNumber,
  email,
  handleActiveTabChange,
}: Props): ReactElement {
  return (
    <TabsContent value="personal" className="space-y-6">
      <Card className="bg-muted/25 @container sm:[--card-spacing:--spacing(6)]">
        <EnrollmentStepCardHeader
          icon={UserRoundIcon}
          title="1. Datos Personales y Contacto"
          description={
            <>
              Actualizá tus datos desde{" "}
              <ReturnToLink href="/account/edit" className="underline underline-offset-4">
                Cuenta
              </ReturnToLink>
              ; para cambiar el documento, contactá a la institución.
            </>
          }
        />
        <CardContent className="space-y-4">
          <div className="grid gap-4 @min-[48rem]:grid-cols-2">
            <Field data-invalid={!!getFieldError(["personalData", "firstName"])}>
              <FieldLabel htmlFor="firstName" required>
                Nombre
              </FieldLabel>
              <Input
                id="firstName"
                value={firstName}
                readOnly
                className={READ_ONLY_INPUT_CLASS_NAME}
                placeholder="Juan"
                autoComplete="given-name"
                aria-invalid={!!getFieldError(["personalData", "firstName"])}
              />
              <FieldError errors={[{ message: getFieldError(["personalData", "firstName"]) }]} />
            </Field>

            <Field data-invalid={!!getFieldError(["personalData", "lastName"])}>
              <FieldLabel htmlFor="lastName" required>
                Apellido
              </FieldLabel>
              <Input
                id="lastName"
                value={lastName}
                readOnly
                className={READ_ONLY_INPUT_CLASS_NAME}
                placeholder="Pérez"
                autoComplete="family-name"
                aria-invalid={!!getFieldError(["personalData", "lastName"])}
              />
              <FieldError errors={[{ message: getFieldError(["personalData", "lastName"]) }]} />
            </Field>
          </div>

          <div className="grid gap-4 @min-[48rem]:grid-cols-2">
            <Field data-invalid={!!getFieldError(["personalData", "documentNumber"])}>
              <FieldLabel htmlFor="documentNumber" required>
                Documento Nacional de Identidad
              </FieldLabel>
              <NumericInput
                id="documentNumber"
                maxLength={8}
                value={documentNumber}
                readOnly
                className={READ_ONLY_INPUT_CLASS_NAME}
                placeholder="12345678"
                aria-invalid={!!getFieldError(["personalData", "documentNumber"])}
              />
              <FieldError errors={[{ message: getFieldError(["personalData", "documentNumber"]) }]} />
            </Field>

            <EnrollmentBirthDateField
              birthDateError={birthDateError}
              calculatedAge={calculatedAge}
              isMinor={isMinor}
              birthDate={birthDate}
              birthDateRequiresProfileUpdate={birthDateRequiresProfileUpdate}
            />
          </div>

          <div className="grid gap-4 @min-[48rem]:grid-cols-2">
            <Field data-invalid={!!getFieldError(["personalData", "phoneNumber"])}>
              <FieldLabel htmlFor="phoneNumber">Teléfono de contacto</FieldLabel>
              <PhoneInput
                id="phoneNumber"
                value={phoneNumber}
                readOnly
                className={READ_ONLY_INPUT_CLASS_NAME}
                placeholder="3534123456"
                autoComplete="tel"
                aria-invalid={!!getFieldError(["personalData", "phoneNumber"])}
              />
              <FieldError errors={[{ message: getFieldError(["personalData", "phoneNumber"]) }]} />
            </Field>

            <Field data-invalid={!!getFieldError(["personalData", "email"])}>
              <FieldLabel htmlFor="email" required>
                Correo electrónico
              </FieldLabel>
              <Input
                id="email"
                type="email"
                value={email}
                readOnly
                className={READ_ONLY_INPUT_CLASS_NAME}
                placeholder="postulante@ejemplo.com"
                autoComplete="email"
                spellCheck={false}
                aria-invalid={!!getFieldError(["personalData", "email"])}
              />
              <FieldError errors={[{ message: getFieldError(["personalData", "email"]) }]} />
            </Field>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col items-stretch sm:flex-row sm:items-center sm:justify-end">
          <Button type="button" size="lg" onClick={() => handleActiveTabChange("education")} className="w-full gap-1.5 sm:w-auto">
            Siguiente: Escolaridad
          </Button>
        </CardFooter>
      </Card>
    </TabsContent>
  );
}
