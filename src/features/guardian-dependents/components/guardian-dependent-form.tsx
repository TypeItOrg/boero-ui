"use client";

import { startTransition, useActionState, useState, type SyntheticEvent, type ReactElement } from "react";

import { unstable_rethrow, useRouter } from "next/navigation";

import { AlertCircleIcon, FileTextIcon, UsersIcon } from "lucide-react";

import { ActionForm } from "@common/components/action-form";
import { SectionHeader } from "@common/components/section-header";
import { Alert, AlertDescription } from "@common/components/ui/alert";
import { Button } from "@common/components/ui/button";
import { rejectFileDragOutside } from "@common/components/ui/file-dropzone";
import { useActionFormErrorFocus } from "@common/hooks/use-action-form-error-focus";

import { finishGuardianDependentRequestAction } from "@features/guardian-dependents/actions/finish-guardian-dependent-request.action";
import { GuardianDependentDocumentsField } from "@features/guardian-dependents/components/guardian-dependent-documents-field";
import { GuardianDependentFormFields } from "@features/guardian-dependents/components/guardian-dependent-form-fields";
import { GUARDIAN_DEPENDENT_MESSAGES } from "@features/guardian-dependents/constants/guardian-dependent.constants";
import { createGuardianDependentSchema } from "@features/guardian-dependents/schemas/create-guardian-dependent.schema";
import type { GuardianDependentActionState } from "@features/guardian-dependents/types/guardian-dependent-action-state.types";
import { validateGuardianDocuments } from "@features/guardian-dependents/utils/guardian-dependent-documents.util";
import { submitGuardianDependent } from "@features/guardian-dependents/utils/submit-guardian-dependent.util";

export function GuardianDependentForm({ institutionId, returnTo }: { institutionId: string; returnTo: string }): ReactElement {
  const router = useRouter();

  const [state, action, isPending] = useActionState<GuardianDependentActionState, FormData>(async (previous, formData) => {
    let result: GuardianDependentActionState;

    try {
      result = await submitGuardianDependent(institutionId, previous, formData);
    } catch {
      return { error: GUARDIAN_DEPENDENT_MESSAGES.CREATE };
    }

    if (!result.success) {
      return result;
    }

    try {
      return await finishGuardianDependentRequestAction(institutionId, returnTo);
    } catch (error) {
      unstable_rethrow(error);

      return { error: GUARDIAN_DEPENDENT_MESSAGES.RETURN_FAILED, requestCreated: true };
    }
  }, {});

  const [values, setValues] = useState({
    firstName: "",
    lastName: "",
    documentNumber: "",
    birthDate: "",
    relationship: "",
    isPrimaryContact: "false",
  });

  const fieldsDisabled = isPending || Boolean(state.requestCreated);

  const formRef = useActionFormErrorFocus(state, isPending);

  const [documents, setDocuments] = useState<File[]>([]);

  const [submittedDocuments, setSubmittedDocuments] = useState<File[]>();

  const canSubmit = !fieldsDisabled && createGuardianDependentSchema.safeParse(values).success && !validateGuardianDocuments(documents);

  function handleSubmit(event: SyntheticEvent<HTMLFormElement>): void {
    event.preventDefault();

    if (!canSubmit) {
      return;
    }

    const formData = new FormData(event.currentTarget);

    for (const document of documents) {
      formData.append("documents", document);
    }

    setSubmittedDocuments(documents);
    startTransition(() => action(formData));
  }

  return (
    <ActionForm
      ref={formRef}
      aria-label="Solicitar vinculación"
      className="flex h-full min-h-0 w-full flex-1 flex-col gap-4"
      noValidate
      onDragOver={rejectFileDragOutside}
      onDrop={rejectFileDragOutside}
      onSubmit={handleSubmit}
    >
      {state.error ? (
        <Alert variant="destructive">
          <AlertCircleIcon aria-hidden="true" className="size-4" />
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      ) : null}

      <section className="bg-muted/25 rounded-xl border p-4 sm:p-5">
        <header className="-mx-4 border-b px-4 pb-4 sm:-mx-5 sm:px-5 sm:pb-5">
          <SectionHeader
            icon={UsersIcon}
            title="Persona a cargo"
            description="Solicitá la vinculación con una persona a tu cargo. Queda pendiente de validación institucional y no podrás gestionarla hasta que se apruebe."
          />
        </header>
        <div className="mt-4 space-y-5 sm:mt-5">
          <GuardianDependentFormFields
            disabled={fieldsDisabled}
            fieldErrors={state.fieldErrors}
            onChange={(field, value) => setValues((previous) => ({ ...previous, [field]: value }))}
            values={values}
          />
        </div>
      </section>

      <section className="bg-muted/25 rounded-xl border p-4 sm:p-5">
        <header className="-mx-4 border-b px-4 pb-4 sm:-mx-5 sm:px-5 sm:pb-5">
          <SectionHeader
            icon={FileTextIcon}
            title="Documentación"
            description="Adjuntá la documentación que respalde la vinculación, si corresponde."
          />
        </header>
        <div className="mt-4 sm:mt-5">
          <GuardianDependentDocumentsField
            disabled={fieldsDisabled}
            error={!isPending && documents === submittedDocuments ? state.fieldErrors?.documents : undefined}
            files={documents}
            onChange={setDocuments}
          />
        </div>
      </section>

      <div className="flex flex-row flex-wrap items-center justify-end gap-3">
        <Button className="flex-1 sm:flex-none" disabled={isPending} onClick={() => router.push(returnTo)} size="lg" type="button" variant="outline">
          {state.requestCreated ? "Volver al listado" : "Cancelar"}
        </Button>
        <Button className="flex-1 sm:flex-none" disabled={!canSubmit} size="lg" type="submit">
          {isPending ? "Enviando…" : "Solicitar"}
        </Button>
      </div>
    </ActionForm>
  );
}
