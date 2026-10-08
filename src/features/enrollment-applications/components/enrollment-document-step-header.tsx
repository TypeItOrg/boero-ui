"use client";

import type { ReactElement } from "react";

import { FileTextIcon, PlusIcon, RefreshCwIcon } from "lucide-react";

import { Button } from "@common/components/ui/button";

import { EnrollmentStepCardHeader } from "@features/enrollment-applications/components/enrollment-step-card-header";
import type { EnrollmentApplicationResponse } from "@features/enrollment-applications/types/enrollment-application-response.types";

export function EnrollmentDocumentStepHeader({
  title,
  application,
  requestUncertain,
  onRequest,
  onReload,
}: {
  title: string;
  application: EnrollmentApplicationResponse;
  requestUncertain: boolean;
  onRequest: () => void;
  onReload: () => Promise<void>;
}): ReactElement {
  return (
    <EnrollmentStepCardHeader
      icon={FileTextIcon}
      title={title}
      description="Documentos requeridos para la inscripción y estado de las entregas."
      actionClassName="@xl/section-header:self-stretch"
      action={
        application.canRequestDocuments ? (
          <div className="flex h-full flex-wrap gap-3 [&>button]:flex-[1_0_min(180px,100%)] @xl/section-header:[&>button]:flex-none">
            <Button
              size="lg"
              className="h-11 w-full @xl/section-header:h-full @xl/section-header:w-11"
              type="button"
              aria-label="Solicitar documentación"
              title="Solicitar documentación"
              disabled={requestUncertain}
              onClick={onRequest}
            >
              <PlusIcon aria-hidden="true" />
              <span className="@xl/section-header:hidden">Solicitar documentación</span>
            </Button>
            {requestUncertain ? (
              <Button size="lg" type="button" variant="outline" onClick={() => void onReload()}>
                <RefreshCwIcon />
                Recargar detalle antes de reintentar
              </Button>
            ) : null}
          </div>
        ) : undefined
      }
    />
  );
}
