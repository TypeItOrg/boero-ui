"use client";

import type { Dispatch, ReactElement, ReactNode, SetStateAction } from "react";

import { FileTextIcon } from "lucide-react";

import { SectionHeader } from "@common/components/section-header";
import { Input } from "@common/components/ui/input";
import { Textarea } from "@common/components/ui/textarea";
import { cn } from "@common/utils/cn.util";

import { FormField, FormSelect } from "@features/academic/components/academic-form-controls";
import { DocumentCatalogFileFormats } from "@features/document-catalog/components/document-catalog-file-formats";
import { DOCUMENT_CATALOG_STATE_OPTIONS } from "@features/document-catalog/constants/document-catalog.constants";
import type { DocumentCatalogActionState } from "@features/document-catalog/types/document-catalog-action-state.types";
import type { DocumentDefinitionDefaults } from "@features/document-catalog/types/document-definition-defaults.types";
import type { DocumentDefinition } from "@features/document-catalog/types/document-definition.types";

export function DocumentCatalogDefinitionFields({
  isDialog,
  initial,
  institutionField,
  disabled,
  confirmationData,
  state,
  name,
  setName,
  defaults,
  allowedFormats,
  setAllowedFormats,
}: {
  isDialog: boolean;
  initial: DocumentDefinition | undefined;
  institutionField: ReactNode;
  disabled: boolean;
  confirmationData: FormData | undefined;
  state: DocumentCatalogActionState;
  name: string;
  setName: Dispatch<SetStateAction<string>>;
  defaults: DocumentDefinitionDefaults | undefined;
  allowedFormats: string[];
  setAllowedFormats: Dispatch<SetStateAction<string[]>>;
}): ReactElement {
  return (
    <section className={isDialog ? undefined : "bg-muted/25 rounded-xl border p-4 sm:p-6"}>
      {!isDialog ? (
        <header className="-mx-4 border-b px-4 pb-4 sm:-mx-6 sm:px-6 sm:pb-5">
          <SectionHeader
            icon={FileTextIcon}
            title={initial ? "Editar documento compartido" : "Crear documento del catálogo"}
            description="El nombre, las instrucciones generales y los formatos se comparten entre trayectos. Las entregas siguen perteneciendo a cada inscripción."
          />
        </header>
      ) : null}
      <div className={isDialog ? "space-y-4" : "mt-5 space-y-5"}>
        {institutionField ? (
          <fieldset disabled={disabled || Boolean(confirmationData)} className="min-w-0">
            {institutionField}
          </fieldset>
        ) : null}
        <div className={cn("grid gap-4", isDialog ? "sm:grid-cols-[minmax(0,1fr)_10rem]" : "md:grid-cols-2")}>
          <FormField name="catalog-name" label="Nombre" error={state.fieldErrors?.name} required>
            <Input
              id="catalog-name"
              aria-invalid={Boolean(state.fieldErrors?.name)}
              name="name"
              value={name}
              onChange={(event) => setName(event.currentTarget.value)}
              maxLength={150}
              required
              disabled={disabled}
              autoFocus={isDialog}
            />
          </FormField>
          <FormField name="catalog-active" label="Estado" error={state.fieldErrors?.active}>
            <FormSelect
              name="active"
              id="catalog-active"
              defaultValue={String(initial?.active ?? defaults?.active ?? true)}
              options={DOCUMENT_CATALOG_STATE_OPTIONS}
              disabled={disabled}
            />
          </FormField>
        </div>
        <DocumentCatalogFileFormats state={state} allowedFormats={allowedFormats} disabled={disabled} setAllowedFormats={setAllowedFormats} />
        <FormField name="catalog-instructions" label="Instrucciones generales" error={state.fieldErrors?.instructions}>
          <Textarea
            id="catalog-instructions"
            aria-invalid={Boolean(state.fieldErrors?.instructions)}
            name="instructions"
            defaultValue={initial?.instructions ?? defaults?.instructions ?? ""}
            rows={3}
            maxLength={1000}
            disabled={disabled}
          />
        </FormField>
      </div>
    </section>
  );
}
