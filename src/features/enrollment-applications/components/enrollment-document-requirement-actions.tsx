"use client";

import type { ReactElement, RefObject } from "react";

import { HistoryIcon, PencilLineIcon } from "lucide-react";

import { Button } from "@common/components/ui/button";

import type { DocumentRequirement } from "@features/enrollment-applications/types/document-requirement.types";

export function EnrollmentDocumentRequirementActions({
  requirement,
  editDocument,
  showDeliveryHistory,
  activityTriggerRef,
  setActivity,
  showRequirementChanges,
}: {
  requirement: DocumentRequirement;
  editDocument: (value: { requirement: DocumentRequirement; operation: "review" | "withdraw" } | null) => void;
  showDeliveryHistory: boolean;
  activityTriggerRef: RefObject<HTMLButtonElement | null>;
  setActivity: (value: { requirement: DocumentRequirement; initialTab: "deliveries" | "changes" } | null) => void;
  showRequirementChanges: boolean;
}): ReactElement {
  return (
    <div className="flex flex-wrap gap-2">
      {requirement.canReview && requirement.currentAttachment ? (
        <Button size="lg" className="min-h-11" type="button" onClick={() => editDocument({ requirement, operation: "review" })}>
          Revisar documento
        </Button>
      ) : null}
      {showDeliveryHistory ? (
        <Button
          size="lg"
          className="min-h-11"
          type="button"
          variant="outline"
          aria-haspopup="dialog"
          onClick={(event) => {
            activityTriggerRef.current = event.currentTarget;
            setActivity({ requirement, initialTab: "deliveries" });
          }}
        >
          <HistoryIcon aria-hidden="true" />
          Ver historial
        </Button>
      ) : null}
      {showRequirementChanges && requirement.changes?.length ? (
        <Button
          size="lg"
          className="min-h-11"
          type="button"
          variant="ghost"
          aria-haspopup="dialog"
          onClick={(event) => {
            activityTriggerRef.current = event.currentTarget;
            setActivity({ requirement, initialTab: "changes" });
          }}
        >
          <PencilLineIcon aria-hidden="true" />
          Cambios del requisito
        </Button>
      ) : null}
    </div>
  );
}
