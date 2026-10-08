"use client";

import type { ReactElement } from "react";

import { Badge } from "@common/components/ui/badge";

import { TrainingPathDocumentInstructions } from "@features/academic/components/training-path-document-instructions";
import { DOCUMENT_LEVEL_LABELS, DOCUMENT_STATUS_LABELS } from "@features/enrollment-applications/constants/documentation.constants";
import type { DocumentRequirement } from "@features/enrollment-applications/types/document-requirement.types";

export function EnrollmentDocumentRequirementHeader({
  requirement,
  administrativeView,
}: {
  requirement: DocumentRequirement;
  administrativeView: boolean;
}): ReactElement {
  return (
    <header className="flex min-w-0 flex-col gap-3 @3xl/documents:flex-row @3xl/documents:items-center @3xl/documents:justify-between @3xl/documents:gap-6">
      <div className="flex min-w-0 items-center gap-1.5 @3xl/documents:flex-1">
        <h3 className="min-w-0 text-lg leading-snug font-semibold break-words">{requirement.name}</h3>
        <TrainingPathDocumentInstructions
          name={requirement.name}
          instructions={requirement.instructions}
          specificInstructions={requirement.specificInstructions}
          className="shrink-0"
        />
      </div>
      <div className="flex flex-wrap items-center gap-2 @3xl/documents:justify-end">
        <Badge variant="secondary" size="lg" className={administrativeView ? "w-full @xl/documents:w-fit" : undefined}>
          {requirement.origin === "ADDITIONAL" && requirement.level === "AT_SUBMISSION"
            ? "Obligatorio antes de aprobar"
            : DOCUMENT_LEVEL_LABELS[requirement.level]}
        </Badge>
        <Badge
          size="lg"
          className={administrativeView ? "w-full @xl/documents:w-fit" : undefined}
          variant={
            requirement.active === false
              ? "secondary"
              : requirement.status === "ACCEPTED"
                ? "success"
                : requirement.status === "OBSERVED"
                  ? "destructive"
                  : "outline"
          }
        >
          {requirement.active === false ? "Requisito retirado" : DOCUMENT_STATUS_LABELS[requirement.status ?? "MISSING"]}
        </Badge>
      </div>
    </header>
  );
}
