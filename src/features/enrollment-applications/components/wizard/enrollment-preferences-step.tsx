"use client";

import type { ReactElement } from "react";

import { SlidersHorizontalIcon } from "lucide-react";

import { Button } from "@common/components/ui/button";
import { Card, CardContent, CardFooter } from "@common/components/ui/card";
import { Field, FieldDescription, FieldError, FieldLabel } from "@common/components/ui/field";
import { Input } from "@common/components/ui/input";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@common/components/ui/select";
import { Switch } from "@common/components/ui/switch";
import { TabsContent } from "@common/components/ui/tabs";

import { EnrollmentStepCardHeader } from "@features/enrollment-applications/components/enrollment-step-card-header";
import type { EnrollmentWizardModel } from "@features/enrollment-applications/types/enrollment-wizard-model.types";

type Props = Pick<
  EnrollmentWizardModel,
  | "preference"
  | "updatePreference"
  | "isMinor"
  | "getFieldError"
  | "shiftOptions"
  | "handleActiveTabChange"
  | "hasDocumentsStep"
  | "readOnly"
  | "setIsSubmitDialogOpen"
  | "saving"
  | "isCancelDialogOpen"
  | "documentsBlocked"
>;

export function EnrollmentPreferencesStep({
  preference,
  updatePreference,
  isMinor,
  getFieldError,
  shiftOptions,
  handleActiveTabChange,
  hasDocumentsStep,
  readOnly,
  setIsSubmitDialogOpen,
  saving,
  isCancelDialogOpen,
  documentsBlocked,
}: Props): ReactElement {
  function renderNextAction(): ReactElement | null {
    if (hasDocumentsStep) {
      return (
        <Button type="button" size="lg" onClick={() => handleActiveTabChange("documents")} className="gap-1.5">
          Siguiente: Documentación
        </Button>
      );
    }

    if (!readOnly) {
      return (
        <Button type="button" size="lg" onClick={() => setIsSubmitDialogOpen(true)} disabled={saving || isCancelDialogOpen || documentsBlocked}>
          Enviar inscripción
        </Button>
      );
    }

    return null;
  }

  return (
    <TabsContent value="preferences" className="space-y-6">
      <Card className="bg-muted/25 @container sm:[--card-spacing:--spacing(6)]">
        <EnrollmentStepCardHeader
          icon={SlidersHorizontalIcon}
          title={isMinor ? "6. Preferencias y Consentimientos" : "5. Preferencias y Consentimientos"}
          description="Seleccioná tu turno preferido y manifestá tus autorizaciones institucionales."
        />
        <CardContent className="space-y-5">
          <Field data-invalid={!!getFieldError(["preference", "preferredShift"])}>
            <FieldLabel htmlFor="preferredShift" required>
              Turno de preferencia
            </FieldLabel>
            <Select value={preference.preferredShift} onValueChange={(value) => updatePreference("preferredShift", value)}>
              <SelectTrigger id="preferredShift" className="h-9! w-full" aria-invalid={!!getFieldError(["preference", "preferredShift"])}>
                <SelectValue placeholder="Seleccioná un turno" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {shiftOptions.length > 0 ? (
                    shiftOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value} className="px-2.5 py-1.5">
                        {option.label}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="__no-shifts" disabled>
                      No hay turnos disponibles
                    </SelectItem>
                  )}
                </SelectGroup>
              </SelectContent>
            </Select>
            <FieldError errors={[{ message: getFieldError(["preference", "preferredShift"]) }]} />
          </Field>

          <div className="flex items-center justify-between gap-4 rounded-lg border p-4">
            <div className="min-w-0 flex-1 space-y-0.5">
              <FieldLabel htmlFor="allowsImageUse" className="text-sm font-medium">
                Autorización para uso de imagen
              </FieldLabel>
              <FieldDescription>
                Autorizo a la institución a registrar y publicar fotografías y videos con fines pedagógicos y difusión cultural.
              </FieldDescription>
            </div>
            <Switch
              id="allowsImageUse"
              size="lg"
              checked={preference.allowsImageUse}
              onCheckedChange={(value) => updatePreference("allowsImageUse", value)}
            />
          </div>

          <div className="flex items-center justify-between gap-4 rounded-lg border p-4">
            <div className="min-w-0 flex-1 space-y-0.5">
              <FieldLabel htmlFor="isReenrolling" className="text-sm font-medium">
                ¿Sos estudiante reingresante?
              </FieldLabel>
              <FieldDescription>Indicá si cursaste materias en este conservatorio o instituto en ciclos anteriores.</FieldDescription>
            </div>
            <Switch
              id="isReenrolling"
              size="lg"
              checked={preference.isReenrolling}
              onCheckedChange={(value) => updatePreference("isReenrolling", value)}
            />
          </div>

          {preference.isReenrolling && (
            <Field data-invalid={!!getFieldError(["preference", "previousTeacher"])}>
              <FieldLabel htmlFor="previousTeacher" required>
                Docente con quien cursaste previamente
              </FieldLabel>
              <Input
                id="previousTeacher"
                value={preference.previousTeacher}
                onChange={(e) => updatePreference("previousTeacher", e.target.value)}
                placeholder="Profesor/a de instrumento o cátedra"
                aria-invalid={!!getFieldError(["preference", "previousTeacher"])}
              />
              <FieldError errors={[{ message: getFieldError(["preference", "previousTeacher"]) }]} />
            </Field>
          )}
        </CardContent>
        <CardFooter className="flex flex-col-reverse items-stretch gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Button type="button" variant="outline" size="lg" onClick={() => handleActiveTabChange("spaces")} className="gap-1.5">
            Atrás
          </Button>
          {renderNextAction()}
        </CardFooter>
      </Card>
    </TabsContent>
  );
}
