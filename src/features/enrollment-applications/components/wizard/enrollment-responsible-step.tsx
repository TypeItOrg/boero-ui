"use client";

import type { ReactElement } from "react";

import { UsersRoundIcon } from "lucide-react";

import { Badge } from "@common/components/ui/badge";
import { Button } from "@common/components/ui/button";
import { Card, CardContent, CardFooter } from "@common/components/ui/card";
import { Field, FieldError, FieldLabel } from "@common/components/ui/field";
import { Input } from "@common/components/ui/input";
import { NumericInput, PhoneInput } from "@common/components/ui/restricted-input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@common/components/ui/select";
import { TabsContent } from "@common/components/ui/tabs";

import { EnrollmentStepCardHeader } from "@features/enrollment-applications/components/enrollment-step-card-header";
import { EDUCATION_LEVEL_OPTIONS } from "@features/enrollment-applications/constants/enrollment-application.constants";
import type { EnrollmentWizardModel } from "@features/enrollment-applications/types/enrollment-wizard-model.types";

type Props = Pick<
  EnrollmentWizardModel,
  | "getFieldError"
  | "isMinor"
  | "responsibleFullName"
  | "setResponsibleFullName"
  | "responsibleDocumentNumber"
  | "setResponsibleDocumentNumber"
  | "responsiblePhoneNumber"
  | "setResponsiblePhoneNumber"
  | "responsibleEmail"
  | "setResponsibleEmail"
  | "responsibleOccupation"
  | "setResponsibleOccupation"
  | "responsibleEducationLevel"
  | "setResponsibleEducationLevel"
  | "handleActiveTabChange"
>;

export function EnrollmentResponsibleStep({
  getFieldError,
  isMinor,
  responsibleFullName,
  setResponsibleFullName,
  responsibleDocumentNumber,
  setResponsibleDocumentNumber,
  responsiblePhoneNumber,
  setResponsiblePhoneNumber,
  responsibleEmail,
  setResponsibleEmail,
  responsibleOccupation,
  setResponsibleOccupation,
  responsibleEducationLevel,
  setResponsibleEducationLevel,
  handleActiveTabChange,
}: Props): ReactElement {
  return (
    <TabsContent value="responsible" className="space-y-6">
      <Card className="bg-muted/25 @container sm:[--card-spacing:--spacing(6)]">
        <EnrollmentStepCardHeader
          icon={UsersRoundIcon}
          title="4. Responsable / Tutor Legal"
          description="Obligatorio: Al ser menor de 18 años, debés consignar los datos de tu tutor o representante legal."
          action={<Badge variant="destructive">Obligatorio (Menor)</Badge>}
        />
        <CardContent className="space-y-4">
          <Field data-invalid={!!getFieldError(["responsible", "fullName"])}>
            <FieldLabel htmlFor="responsibleFullName" required={isMinor}>
              Nombre y Apellido del Responsable
            </FieldLabel>
            <Input
              id="responsibleFullName"
              value={responsibleFullName}
              onChange={(e) => setResponsibleFullName(e.target.value)}
              placeholder="María Rodríguez"
              autoComplete="name"
              aria-invalid={!!getFieldError(["responsible", "fullName"])}
            />
            <FieldError errors={[{ message: getFieldError(["responsible", "fullName"]) }]} />
          </Field>

          <div className="grid gap-4 @min-[48rem]:grid-cols-2">
            <Field data-invalid={!!getFieldError(["responsible", "documentNumber"])}>
              <FieldLabel htmlFor="responsibleDocumentNumber" required={isMinor}>
                DNI del Responsable
              </FieldLabel>
              <NumericInput
                id="responsibleDocumentNumber"
                maxLength={8}
                value={responsibleDocumentNumber}
                onChange={(e) => setResponsibleDocumentNumber(e.target.value)}
                placeholder="20123456"
                aria-invalid={!!getFieldError(["responsible", "documentNumber"])}
              />
              <FieldError errors={[{ message: getFieldError(["responsible", "documentNumber"]) }]} />
            </Field>

            <Field data-invalid={!!getFieldError(["responsible", "phoneNumber"])}>
              <FieldLabel htmlFor="responsiblePhoneNumber" required={isMinor}>
                Teléfono del Responsable
              </FieldLabel>
              <PhoneInput
                id="responsiblePhoneNumber"
                value={responsiblePhoneNumber}
                onChange={(e) => setResponsiblePhoneNumber(e.target.value)}
                placeholder="3534987654"
                autoComplete="tel"
                aria-invalid={!!getFieldError(["responsible", "phoneNumber"])}
              />
              <FieldError errors={[{ message: getFieldError(["responsible", "phoneNumber"]) }]} />
            </Field>
          </div>

          <div className="grid gap-4 @min-[48rem]:grid-cols-2">
            <Field data-invalid={!!getFieldError(["responsible", "email"])}>
              <FieldLabel htmlFor="responsibleEmail" required={isMinor}>
                Correo electrónico
              </FieldLabel>
              <Input
                id="responsibleEmail"
                type="email"
                value={responsibleEmail}
                onChange={(e) => setResponsibleEmail(e.target.value)}
                placeholder="tutor@ejemplo.com"
                autoComplete="email"
                spellCheck={false}
                aria-invalid={!!getFieldError(["responsible", "email"])}
              />
              <FieldError errors={[{ message: getFieldError(["responsible", "email"]) }]} />
            </Field>

            <Field data-invalid={!!getFieldError(["responsible", "occupation"])}>
              <FieldLabel htmlFor="responsibleOccupation" required={isMinor}>
                Ocupación / Profesión
              </FieldLabel>
              <Input
                id="responsibleOccupation"
                value={responsibleOccupation}
                onChange={(e) => setResponsibleOccupation(e.target.value)}
                placeholder="Empleado / Docente / Comercio"
                aria-invalid={!!getFieldError(["responsible", "occupation"])}
              />
              <FieldError errors={[{ message: getFieldError(["responsible", "occupation"]) }]} />
            </Field>
          </div>

          <Field data-invalid={!!getFieldError(["responsible", "educationLevel"])}>
            <FieldLabel htmlFor="responsibleEducationLevel" required={isMinor}>
              Nivel de Instrucción
            </FieldLabel>
            <Select value={responsibleEducationLevel} onValueChange={setResponsibleEducationLevel}>
              <SelectTrigger className="w-full" aria-invalid={!!getFieldError(["responsible", "educationLevel"])}>
                <SelectValue placeholder="Seleccioná el máximo nivel alcanzado" />
              </SelectTrigger>
              <SelectContent>
                {EDUCATION_LEVEL_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FieldError errors={[{ message: getFieldError(["responsible", "educationLevel"]) }]} />
          </Field>
        </CardContent>
        <CardFooter className="flex flex-col-reverse items-stretch gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Button type="button" variant="outline" size="lg" onClick={() => handleActiveTabChange("health")} className="gap-1.5">
            Atrás
          </Button>
          <Button type="button" size="lg" onClick={() => handleActiveTabChange("spaces")} className="gap-1.5">
            Siguiente: Cursos
          </Button>
        </CardFooter>
      </Card>
    </TabsContent>
  );
}
