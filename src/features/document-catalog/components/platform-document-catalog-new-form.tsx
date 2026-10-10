"use client";

import { useState, type ReactElement } from "react";

import { DocumentCatalogForm } from "@features/document-catalog/components/document-catalog-form";
import { DocumentCatalogInstitutionField } from "@features/document-catalog/components/document-catalog-institution-field";
import type { DocumentDefinitionDefaults } from "@features/document-catalog/types/document-definition-defaults.types";

export function PlatformDocumentCatalogNewForm({
  institutionId,
  institutionName,
  returnTo,
  defaults,
  copySourceInstitutionId,
}: {
  institutionId?: string;
  institutionName?: string;
  returnTo: string;
  defaults?: DocumentDefinitionDefaults;
  copySourceInstitutionId?: string;
}): ReactElement {
  const [institution, setInstitution] = useState<{ id: string; name?: string } | undefined>(
    institutionId ? { id: institutionId, name: institutionName } : undefined,
  );

  const [pending, setPending] = useState(false);

  const institutionField = (
    <DocumentCatalogInstitutionField
      id="new-document-institution"
      value={institution?.id}
      label={institution?.name}
      disabled={pending}
      excludedInstitutionId={copySourceInstitutionId}
      onValueChange={(id, item) => {
        setInstitution(id && item ? { id, name: item.name } : undefined);
      }}
    />
  );

  return (
    <DocumentCatalogForm
      scope="admin"
      defaults={defaults}
      copySourceInstitutionId={copySourceInstitutionId}
      institutionId={institution?.id}
      institutionField={institutionField}
      returnTo={returnTo}
      onPendingChange={setPending}
    />
  );
}
