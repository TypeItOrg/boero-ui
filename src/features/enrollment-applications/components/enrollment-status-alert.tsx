"use client";

import type { ReactElement } from "react";

import { BanIcon, CheckCircle2Icon, ClockIcon, XCircleIcon } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@common/components/ui/alert";

import type { EnrollmentApplicationResponse } from "@features/enrollment-applications/types/enrollment-application-response.types";
import { ENROLLMENT_APPLICATION_STATUS } from "@features/enrollment-applications/types/enrollment-application-status.types";

export function getStatusAlert(application: EnrollmentApplicationResponse): ReactElement | null {
  if (application.status === ENROLLMENT_APPLICATION_STATUS.PROVISIONALLY_APPROVED) {
    return (
      <Alert>
        <ClockIcon />
        <AlertTitle>Admitida provisoriamente</AlertTitle>
        <AlertDescription>Podés continuar con tu incorporación y completar aquí la documentación pendiente.</AlertDescription>
      </Alert>
    );
  }

  if (application.status === ENROLLMENT_APPLICATION_STATUS.SUBMITTED) {
    return (
      <Alert className="bg-card border-amber-500/30 text-amber-800 dark:text-amber-300">
        <ClockIcon />
        <AlertTitle>Solicitud en revisión</AlertTitle>
        <AlertDescription>
          La institución está revisando los datos y la documentación presentada. Te contactará si necesita algo más.
        </AlertDescription>
      </Alert>
    );
  }

  if (application.status === ENROLLMENT_APPLICATION_STATUS.APPROVED) {
    return (
      <Alert variant="success">
        <CheckCircle2Icon />
        <AlertTitle>Solicitud aprobada</AlertTitle>
        <AlertDescription>La institución te indicará los próximos pasos para confirmar la matrícula.</AlertDescription>
      </Alert>
    );
  }

  if (application.status === ENROLLMENT_APPLICATION_STATUS.REJECTED) {
    return (
      <Alert variant="destructive">
        <XCircleIcon />
        <AlertTitle>Solicitud no admitida</AlertTitle>
        <AlertDescription>{application.rejectionReason || "Contactá a la institución para obtener más información."}</AlertDescription>
      </Alert>
    );
  }

  if (application.status === ENROLLMENT_APPLICATION_STATUS.CANCELLED) {
    return (
      <Alert>
        <BanIcon />
        <AlertTitle>Solicitud cancelada</AlertTitle>
        <AlertDescription>Esta solicitud ya no puede editarse ni ser evaluada.</AlertDescription>
      </Alert>
    );
  }

  return null;
}
