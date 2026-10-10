"use client";

import type { ReactElement } from "react";

import { Tabs } from "@common/components/ui/tabs";

import { EnrollmentCourseStep } from "@features/enrollment-applications/components/wizard/enrollment-course-step";
import { EnrollmentDocumentsStep } from "@features/enrollment-applications/components/wizard/enrollment-documents-step";
import { EnrollmentHealthStep } from "@features/enrollment-applications/components/wizard/enrollment-health-step";
import { EnrollmentPersonalStep } from "@features/enrollment-applications/components/wizard/enrollment-personal-step";
import { EnrollmentPreferencesStep } from "@features/enrollment-applications/components/wizard/enrollment-preferences-step";
import { EnrollmentResponsibleStep } from "@features/enrollment-applications/components/wizard/enrollment-responsible-step";
import { EnrollmentSchoolingStep } from "@features/enrollment-applications/components/wizard/enrollment-schooling-step";
import { EnrollmentWizardNavigation } from "@features/enrollment-applications/components/wizard/enrollment-wizard-navigation";
import type { EnrollmentWizardModel } from "@features/enrollment-applications/types/enrollment-wizard-model.types";

export function EnrollmentWizardSteps({ model }: { model: EnrollmentWizardModel }): ReactElement {
  return (
    <Tabs
      value={model.effectiveActiveTab}
      onValueChange={model.handleActiveTabChange}
      className="w-full gap-3 [&_[data-slot=card-footer]_[data-slot=button]]:h-auto [&_[data-slot=card-footer]_[data-slot=button]]:min-h-9 [&_[data-slot=card-footer]_[data-slot=button]]:w-full [&_[data-slot=card-footer]_[data-slot=button]]:max-w-full [&_[data-slot=card-footer]_[data-slot=button]]:py-2 [&_[data-slot=card-footer]_[data-slot=button]]:text-center [&_[data-slot=card-footer]_[data-slot=button]]:whitespace-normal sm:[&_[data-slot=card-footer]_[data-slot=button]]:h-9 sm:[&_[data-slot=card-footer]_[data-slot=button]]:w-auto sm:[&_[data-slot=card-footer]_[data-slot=button]]:whitespace-nowrap"
    >
      <EnrollmentWizardNavigation {...model} />
      <EnrollmentPersonalStep {...model} />
      <EnrollmentSchoolingStep {...model} />
      <EnrollmentHealthStep {...model} />
      {model.isMinor ? <EnrollmentResponsibleStep {...model} /> : null}
      <EnrollmentCourseStep {...model} />
      <EnrollmentPreferencesStep {...model} />
      {model.hasDocumentsStep ? (
        // Keep the document snapshot mounted while navigating between steps.
        <EnrollmentDocumentsStep {...model} />
      ) : null}
    </Tabs>
  );
}
