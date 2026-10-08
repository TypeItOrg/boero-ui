"use client";

import type { ReactElement } from "react";

import Link from "next/link";

import { AlertCircleIcon, AlertTriangleIcon, BanIcon } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@common/components/ui/alert";
import { Button } from "@common/components/ui/button";

import { EnrollmentCancelDialog } from "@features/enrollment-applications/components/enrollment-cancel-dialog";
import { EnrollmentDocuments } from "@features/enrollment-applications/components/enrollment-documents";
import { EnrollmentSubmitDialog } from "@features/enrollment-applications/components/enrollment-submit-dialog";
import { EnrollmentStatusCard } from "@features/enrollment-applications/components/EnrollmentStatusCard";
import { EnrollmentDraftStatus } from "@features/enrollment-applications/components/wizard/enrollment-draft-status";
import { EnrollmentWizardSteps } from "@features/enrollment-applications/components/wizard/enrollment-wizard-steps";
import { ENROLLMENT_MESSAGES } from "@features/enrollment-applications/constants/enrollment-messages.constants";
import { useEnrollmentWizard } from "@features/enrollment-applications/hooks/use-enrollment-wizard";
import { ENROLLMENT_APPLICATION_STATUS } from "@features/enrollment-applications/types/enrollment-application-status.types";
import type { EnrollmentWizardProps } from "@features/enrollment-applications/types/enrollment-wizard-props.types";

export function EnrollmentWizard(props: EnrollmentWizardProps): ReactElement {
  const model = useEnrollmentWizard(props);
  const { application, validationIssues } = model;

  if (application.status !== ENROLLMENT_APPLICATION_STATUS.DRAFT) {
    return <EnrollmentStatusCard application={application} />;
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button asChild variant="outline" size="lg">
          <Link href={model.returnTo}>Volver</Link>
        </Button>
        {!model.requestedReadOnly ? (
          <Button type="button" variant="destructive" size="lg" onClick={() => model.setIsCancelDialogOpen(true)} disabled={model.documentsBlocked}>
            <BanIcon className="size-4" />
            Cancelar
          </Button>
        ) : null}
      </div>

      {model.readOnly ? (
        <Alert variant="default" className="border-amber-200 bg-amber-50">
          <AlertTriangleIcon className="size-4 text-amber-600" />
          <AlertTitle className="text-amber-900">Solicitud de inscripción - Visualización</AlertTitle>
          <AlertDescription className="text-amber-800">
            {application.periodOpen === false
              ? ENROLLMENT_MESSAGES.PERIOD_CLOSED_DRAFT
              : "Los datos de esta solicitud se muestran solo para consulta."}
          </AlertDescription>
        </Alert>
      ) : null}

      <EnrollmentDraftStatus {...model} />
      {validationIssues.length > 0 ? (
        <Alert variant="destructive">
          <AlertCircleIcon />
          <AlertTitle>{ENROLLMENT_MESSAGES.INCOMPLETE_FIELDS_TITLE(validationIssues.length)}</AlertTitle>
          <AlertDescription>
            <ul className="mt-1 list-disc space-y-0.5 pl-4">
              {validationIssues.map((issue, index) => (
                <li key={index}>{issue.message}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      ) : null}

      <EnrollmentWizardSteps model={model} />
      {!model.hasDocumentsStep && application.canReadAttachments && application.documents?.some((requirement) => requirement.active === false) ? (
        <EnrollmentDocuments application={application} title="Historial de documentación retirada" />
      ) : null}

      {model.isCancelDialogOpen ? (
        <EnrollmentCancelDialog
          applicationId={application.applicationId}
          beforeCancel={() => model.draftSaveQueue.current}
          onClose={() => model.setIsCancelDialogOpen(false)}
          onCancelled={(cancelledApplication) => {
            model.setApplication(cancelledApplication);
            model.router.refresh();
          }}
        />
      ) : null}
      {model.isSubmitDialogOpen ? (
        <EnrollmentSubmitDialog onClose={() => model.setIsSubmitDialogOpen(false)} onSubmit={model.submitApplication} />
      ) : null}
    </div>
  );
}
