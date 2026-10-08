"use client";

import { useRef, useState, type ReactElement } from "react";

import { Button } from "@common/components/ui/button";
import { appendReturnTo } from "@common/utils/return-to.util";

import { DocumentCatalogCopyConfirmation } from "@features/document-catalog/components/document-catalog-copy-confirmation";
import { DocumentCatalogForm } from "@features/document-catalog/components/document-catalog-form";
import { DocumentCatalogInstitutionField } from "@features/document-catalog/components/document-catalog-institution-field";
import type { DocumentDefinition } from "@features/document-catalog/types/document-definition.types";

export function PlatformDocumentCatalogEditForm({
  document,
  institutionName,
  returnTo,
}: {
  document: DocumentDefinition;
  institutionName: string;
  returnTo: string;
}): ReactElement {
  const [institution, setInstitution] = useState({
    id: document.institutionId,
    name: institutionName,
  });

  const [pending, setPending] = useState(false);
  const [copyOpen, setCopyOpen] = useState(false);
  const copyButtonRef = useRef<HTMLButtonElement>(null);
  const canChangeInstitution = document.canChangeInstitution === true;
  const copyUrl = appendReturnTo(`/admin/documentation/new?copyFrom=${document.id}&sourceInstitutionId=${document.institutionId}`, returnTo);

  return (
    <DocumentCatalogForm
      scope="admin"
      institutionId={document.institutionId}
      targetInstitutionId={institution.id}
      initial={document}
      returnTo={returnTo}
      onPendingChange={setPending}
      institutionField={
        <>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <div className="min-w-0 flex-1">
              <DocumentCatalogInstitutionField
                id="edit-document-institution"
                value={institution.id}
                label={institution.name}
                disabled={pending}
                readOnly={!canChangeInstitution}
                clearable={false}
                onValueChange={(id, item) => {
                  if (canChangeInstitution && id && item) {
                    setInstitution({ id, name: item.name });
                  }
                }}
              />
            </div>
            {!canChangeInstitution ? (
              <Button
                ref={copyButtonRef}
                type="button"
                size="lg"
                variant="outline"
                className="w-full shrink-0 sm:w-auto"
                disabled={pending}
                onClick={() => setCopyOpen(true)}
              >
                Crear copia en otra institución
              </Button>
            ) : null}
          </div>
          {copyOpen ? <DocumentCatalogCopyConfirmation href={copyUrl} onClose={() => setCopyOpen(false)} returnFocusRef={copyButtonRef} /> : null}
        </>
      }
    />
  );
}
