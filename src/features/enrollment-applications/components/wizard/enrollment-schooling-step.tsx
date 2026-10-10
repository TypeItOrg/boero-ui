"use client";

import type { ReactElement } from "react";

import { GraduationCapIcon } from "lucide-react";

import { Button } from "@common/components/ui/button";
import { Card, CardFooter } from "@common/components/ui/card";
import { TabsContent } from "@common/components/ui/tabs";

import { EnrollmentStepCardHeader } from "@features/enrollment-applications/components/enrollment-step-card-header";
import { EnrollmentSchoolingFields } from "@features/enrollment-applications/components/wizard/enrollment-schooling-fields";
import type { EnrollmentWizardModel } from "@features/enrollment-applications/types/enrollment-wizard-model.types";

type Props = Pick<
  EnrollmentWizardModel,
  "getFieldError" | "schooling" | "handleCurrentlyStudyingChange" | "handleEducationLevelChange" | "dispatchSchooling" | "handleActiveTabChange"
>;

export function EnrollmentSchoolingStep({
  getFieldError,
  schooling,
  handleCurrentlyStudyingChange,
  handleEducationLevelChange,
  dispatchSchooling,
  handleActiveTabChange,
}: Props): ReactElement {
  return (
    <TabsContent value="education" className="space-y-6">
      <Card className="bg-muted/25 @container sm:[--card-spacing:--spacing(6)]">
        <EnrollmentStepCardHeader
          icon={GraduationCapIcon}
          title="2. Escolaridad"
          description="Contanos sobre tu escolaridad actual o el máximo nivel que alcanzaste."
        />
        <EnrollmentSchoolingFields
          getFieldError={getFieldError}
          schooling={schooling}
          handleCurrentlyStudyingChange={handleCurrentlyStudyingChange}
          handleEducationLevelChange={handleEducationLevelChange}
          dispatchSchooling={dispatchSchooling}
        />
        <CardFooter className="flex flex-col-reverse items-stretch gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Button type="button" variant="outline" size="lg" onClick={() => handleActiveTabChange("personal")} className="gap-1.5">
            Atrás
          </Button>
          <Button type="button" size="lg" onClick={() => handleActiveTabChange("health")} className="gap-1.5">
            Siguiente: Salud e Inclusión
          </Button>
        </CardFooter>
      </Card>
    </TabsContent>
  );
}
