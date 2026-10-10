"use client";

import type { ReactElement } from "react";

import { AlertTriangleIcon, HeartHandshakeIcon } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@common/components/ui/alert";
import { Button } from "@common/components/ui/button";
import { Card, CardContent, CardFooter } from "@common/components/ui/card";
import { Field, FieldDescription, FieldError, FieldLabel } from "@common/components/ui/field";
import { Switch } from "@common/components/ui/switch";
import { TabsContent } from "@common/components/ui/tabs";
import { Textarea } from "@common/components/ui/textarea";

import { EnrollmentStepCardHeader } from "@features/enrollment-applications/components/enrollment-step-card-header";
import type { EnrollmentWizardModel } from "@features/enrollment-applications/types/enrollment-wizard-model.types";

type Props = Pick<EnrollmentWizardModel, "healthInclusion" | "updateHealthInclusion" | "getFieldError" | "handleActiveTabChange" | "isMinor">;

export function EnrollmentHealthStep({ healthInclusion, updateHealthInclusion, getFieldError, handleActiveTabChange, isMinor }: Props): ReactElement {
  return (
    <TabsContent value="health" className="space-y-6">
      <Card className="bg-muted/25 @container sm:[--card-spacing:--spacing(6)]">
        <EnrollmentStepCardHeader
          icon={HeartHandshakeIcon}
          title="3. Salud e Inclusión"
          description="Información para garantizar la equidad, accesibilidad y ajustes razonables en tu formación."
        />
        <CardContent className="space-y-5">
          <div className="flex items-center justify-between gap-4 rounded-lg border p-4">
            <div className="min-w-0 flex-1 space-y-0.5">
              <FieldLabel htmlFor="receivesReasonableAdjustments" className="text-sm font-medium">
                ¿Requiere ajustes razonables o apoyos específicos?
              </FieldLabel>
              <FieldDescription>Ajustes pedagógicos, edilicios o de acompañamiento por razones de salud o discapacidad.</FieldDescription>
            </div>
            <Switch
              id="receivesReasonableAdjustments"
              size="lg"
              checked={healthInclusion.receivesReasonableAdjustments}
              onCheckedChange={(value) => updateHealthInclusion("receivesReasonableAdjustments", value)}
            />
          </div>

          {healthInclusion.receivesReasonableAdjustments && (
            <div className="space-y-4 rounded-lg border border-amber-500/30 bg-amber-500/5 p-4">
              <Alert className="border-amber-500/30 bg-amber-500/10 text-amber-900 dark:text-amber-200">
                <AlertTriangleIcon className="size-4 text-amber-600 dark:text-amber-400" />
                <AlertTitle>Documentación médica requerida</AlertTitle>
                <AlertDescription>
                  Al solicitar ajustes razonables, deberás presentar el Certificado Único de Discapacidad (CUD) o informe médico pertinente en la
                  institución de forma física.
                </AlertDescription>
              </Alert>

              <Field data-invalid={!!getFieldError(["healthInclusion", "adjustmentDetails"])}>
                <FieldLabel htmlFor="adjustmentDetails" required>
                  Detalle de los apoyos requeridos
                </FieldLabel>
                <Textarea
                  id="adjustmentDetails"
                  value={healthInclusion.adjustmentDetails}
                  onChange={(e) => updateHealthInclusion("adjustmentDetails", e.target.value)}
                  placeholder="Describí brevemente los apoyos que necesitás para tu cursada…"
                  rows={3}
                  aria-invalid={!!getFieldError(["healthInclusion", "adjustmentDetails"])}
                />
                <FieldError errors={[{ message: getFieldError(["healthInclusion", "adjustmentDetails"]) }]} />
              </Field>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex flex-col-reverse items-stretch gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Button type="button" variant="outline" size="lg" onClick={() => handleActiveTabChange("education")} className="gap-1.5">
            Atrás
          </Button>
          <Button type="button" size="lg" onClick={() => handleActiveTabChange(isMinor ? "responsible" : "spaces")} className="gap-1.5">
            {isMinor ? "Siguiente: Tutor Legal" : "Siguiente: Cursos"}
          </Button>
        </CardFooter>
      </Card>
    </TabsContent>
  );
}
