"use client";

import type { ReactElement } from "react";

import { Button } from "@common/components/ui/button";
import { TabsContent } from "@common/components/ui/tabs";

import { EnrollmentDocuments } from "@features/enrollment-applications/components/enrollment-documents";
import type { EnrollmentWizardModel } from "@features/enrollment-applications/types/enrollment-wizard-model.types";

type Props = Pick<
  EnrollmentWizardModel,
  | "effectiveActiveTab"
  | "application"
  | "visibleTabs"
  | "readOnly"
  | "isSubmitDialogOpen"
  | "isCancelDialogOpen"
  | "changeDocumentBlocked"
  | "handleActiveTabChange"
  | "setIsSubmitDialogOpen"
  | "saving"
  | "documentsBlocked"
>;

export function EnrollmentDocumentsStep({
  effectiveActiveTab,
  application,
  visibleTabs,
  readOnly,
  isSubmitDialogOpen,
  isCancelDialogOpen,
  changeDocumentBlocked,
  handleActiveTabChange,
  setIsSubmitDialogOpen,
  saving,
  documentsBlocked,
}: Props): ReactElement {
  return (
    <TabsContent value="documents" forceMount hidden={effectiveActiveTab !== "documents"} className="space-y-6">
      <EnrollmentDocuments
        application={application}
        title={visibleTabs.find((tab) => tab.id === "documents")?.label}
        autoSave
        disabled={readOnly || isSubmitDialogOpen || isCancelDialogOpen}
        onUploadBlockedChange={changeDocumentBlocked}
        footer={
          <>
            <Button type="button" variant="outline" size="lg" onClick={() => handleActiveTabChange("preferences")} className="gap-1.5">
              Atrás
            </Button>
            {!readOnly ? (
              <Button type="button" size="lg" onClick={() => setIsSubmitDialogOpen(true)} disabled={saving || isCancelDialogOpen || documentsBlocked}>
                Enviar inscripción
              </Button>
            ) : null}
          </>
        }
      />
    </TabsContent>
  );
}
