"use client";

import { useActionState, useState, type ReactElement } from "react";

import Link from "next/link";

import { ActionForm } from "@common/components/action-form";
import { ReturnToLink } from "@common/components/navigation/return-to-link";
import { SectionHeader } from "@common/components/section-header";
import { Alert, AlertDescription, AlertTitle } from "@common/components/ui/alert";
import { Button } from "@common/components/ui/button";
import { useActionFormErrorFocus } from "@common/hooks/use-action-form-error-focus";

import { saveAcademicResourceAction } from "@features/academic/actions/academic-resource.action";
import { saveTrainingPathAction } from "@features/academic/actions/save-training-path.action";
import { AcademicFormFields } from "@features/academic/components/academic-form-fields";
import { PlatformInstitutionFormField } from "@features/academic/components/platform-institution-form-field";
import { TrainingPathDocumentFields } from "@features/academic/components/training-path-document-fields";
import { ACADEMIC_RESOURCE_ICONS } from "@features/academic/config/academic-resource-icons.config";
import { CREATE_ACTION_LABELS, FORM_SECTION_COPY } from "@features/academic/constants/academic-form-copy.constants";
import type { AcademicActionState } from "@features/academic/types/academic-action-state.types";
import type { AcademicFormOptions } from "@features/academic/types/academic-form-options.types";
import { AcademicResource } from "@features/academic/types/academic-resource.types";
import type { AcademicScope } from "@features/academic/utils/academic-scope.util";
import { getAcademicResourceRoute } from "@features/academic/utils/academic-scope.util";
import type { DocumentRequirement } from "@features/enrollment-applications/types/document-requirement.types";
import type { InstitutionSummary } from "@features/institutions/types/institution-summary.types";

type AcademicResourceFormProps = AcademicFormOptions & {
  scope: AcademicScope;
  institutionId?: string;
  allowInstitutionSelection?: boolean;
  resource: AcademicResource;
  id?: string;
  parentId?: string;
  returnTo: string;
  documentRequirements?: DocumentRequirement[];
  canEditDocumentRequirements?: boolean;
  canManageDocumentCatalog?: boolean;
};

const initialState: AcademicActionState = {};

export function AcademicResourceForm({
  scope,
  institutionId,
  allowInstitutionSelection = false,
  resource,
  id,
  parentId,
  returnTo,
  documentRequirements,
  canEditDocumentRequirements = true,
  canManageDocumentCatalog = false,
  ...options
}: AcademicResourceFormProps): ReactElement {
  const [institution, setInstitution] = useState<InstitutionSummary>();
  const effectiveInstitutionId = institutionId ?? institution?.id;
  const action =
    resource === AcademicResource.TRAINING_PATH
      ? saveTrainingPathAction.bind(null, scope, institutionId, id, returnTo)
      : saveAcademicResourceAction.bind(null, scope, institutionId, resource, id, parentId, returnTo);
  const [state, formAction, pending] = useActionState(action, initialState);
  const section = FORM_SECTION_COPY[resource];
  const Icon = ACADEMIC_RESOURCE_ICONS[resource];
  const submitLabel = id || state.trainingPathProgress ? "Guardar cambios" : CREATE_ACTION_LABELS[resource];
  const hasFieldErrors = Object.keys(state.fieldErrors ?? {}).length > 0;
  const savedTrainingPathHref =
    state.trainingPathProgress && effectiveInstitutionId
      ? `${getAcademicResourceRoute(scope, effectiveInstitutionId, AcademicResource.TRAINING_PATH)}/${state.trainingPathProgress.trainingPathId}`
      : undefined;

  const formRef = useActionFormErrorFocus(state, pending);

  return (
    <ActionForm ref={formRef} action={formAction} noValidate className="flex h-full min-h-0 w-full flex-1 flex-col">
      <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto pb-4">
        {state.error && !hasFieldErrors ? (
          <Alert variant="destructive">
            <AlertTitle>No se pudo guardar</AlertTitle>
            <AlertDescription>
              {state.error}
              {savedTrainingPathHref ? (
                <ReturnToLink href={savedTrainingPathHref} className="font-medium underline">
                  Revisar trayecto guardado
                </ReturnToLink>
              ) : null}
            </AlertDescription>
          </Alert>
        ) : null}

        {resource === AcademicResource.COURSE ? (
          <AcademicFormFields
            key={`${resource}-${effectiveInstitutionId ?? "no-institution"}`}
            fieldErrors={state.fieldErrors}
            institutionField={
              allowInstitutionSelection ? (
                <PlatformInstitutionFormField error={state.fieldErrors?.institutionId} institution={institution} onChange={setInstitution} />
              ) : null
            }
            institutionId={effectiveInstitutionId}
            resource={resource}
            scope={scope}
            {...options}
          />
        ) : (
          <section className="bg-muted/25 rounded-xl border p-4 sm:p-5 md:p-6">
            <header className="-mx-4 border-b px-4 pb-4 sm:-mx-5 sm:px-5 sm:pb-5 md:-mx-6 md:px-6">
              <SectionHeader icon={Icon} title={section.title} description={section.description} />
            </header>
            <div className="mt-5 flex flex-wrap gap-4">
              {allowInstitutionSelection ? (
                <PlatformInstitutionFormField error={state.fieldErrors?.institutionId} institution={institution} onChange={setInstitution} />
              ) : null}
              <AcademicFormFields
                key={`${resource}-${effectiveInstitutionId ?? "no-institution"}`}
                fieldErrors={state.fieldErrors}
                institutionId={effectiveInstitutionId}
                resource={resource}
                scope={scope}
                {...options}
              />
            </div>
          </section>
        )}
        {resource === AcademicResource.TRAINING_PATH ? (
          <TrainingPathDocumentFields
            scope={scope}
            institutionId={effectiveInstitutionId}
            pathId={id ?? state.trainingPathProgress?.trainingPathId}
            canManageCatalog={scope === "admin" || canManageDocumentCatalog}
            requirements={documentRequirements}
            canEdit={canEditDocumentRequirements}
            pending={pending || state.trainingPathSaveUncertain === true}
            error={state.fieldErrors?.documentRequirements}
            savedRequirementIds={state.trainingPathProgress?.requirementIds}
          />
        ) : null}
      </div>

      <div className="bg-background sticky bottom-0 z-10 mt-auto flex flex-row flex-wrap items-center justify-end gap-3">
        <Button asChild type="button" variant="outline" size="lg" className="flex-1 sm:flex-none">
          <Link href={returnTo}>Cancelar</Link>
        </Button>
        <Button type="submit" size="lg" className="flex-1 sm:flex-none" disabled={pending || state.trainingPathSaveUncertain === true}>
          {pending ? "Guardando…" : submitLabel}
        </Button>
      </div>
    </ActionForm>
  );
}
