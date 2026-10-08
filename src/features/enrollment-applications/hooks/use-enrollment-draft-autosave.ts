"use client";

import { startTransition, useActionState, useEffect, useRef, type Dispatch, type SetStateAction } from "react";

import { useDebouncedValue } from "@common/hooks/use-debounced-value";

import { updateEnrollmentDraftAction } from "@features/enrollment-applications/actions/enrollment-application.actions";
import { ENROLLMENT_MESSAGES } from "@features/enrollment-applications/constants/enrollment-messages.constants";
import type { EnrollmentApplicationData } from "@features/enrollment-applications/types/enrollment-application-data.types";
import type { EnrollmentApplicationResponse } from "@features/enrollment-applications/types/enrollment-application-response.types";
import { ENROLLMENT_APPLICATION_STATUS } from "@features/enrollment-applications/types/enrollment-application-status.types";
import { unwrapEnrollmentResult } from "@features/enrollment-applications/utils/unwrap-enrollment-result.util";

export function useEnrollmentDraftAutosave({
  application,
  readOnly,
  isSubmitDialogOpen,
  isCancelDialogOpen,
  structuredData,
  selectedTrainingPathId,
  setApplication,
}: {
  application: EnrollmentApplicationResponse;
  readOnly: boolean;
  isSubmitDialogOpen: boolean;
  isCancelDialogOpen: boolean;
  structuredData: EnrollmentApplicationData;
  selectedTrainingPathId: string;
  setApplication: Dispatch<SetStateAction<EnrollmentApplicationResponse>>;
}) {
  const [autosaveState, saveDraft, saving] = useActionState(
    async (_previous: { error?: string }, save: () => Promise<{ error?: string }>) => save(),
    {},
  );

  const draftSaveQueue = useRef<Promise<void>>(Promise.resolve());
  const autosaveInitializedRef = useRef(false);
  const lastSavedDataRef = useRef<string | null>(null);
  const dataSignature = JSON.stringify(structuredData);
  const debouncedSignature = useDebouncedValue(dataSignature, 800);
  const debouncedDataIsCurrent = debouncedSignature === dataSignature;

  const autosaveTarget =
    application?.status === ENROLLMENT_APPLICATION_STATUS.DRAFT &&
    !readOnly &&
    !isSubmitDialogOpen &&
    !isCancelDialogOpen &&
    debouncedDataIsCurrent &&
    structuredData.careerSelection?.trainingPathId === (selectedTrainingPathId || undefined)
      ? application.applicationId
      : null;

  useEffect(() => {
    if (!autosaveTarget) {
      return;
    }

    const targetApplicationId = autosaveTarget;
    const dataSignature = debouncedSignature;

    if (!autosaveInitializedRef.current) {
      autosaveInitializedRef.current = true;
      lastSavedDataRef.current = dataSignature;

      return;
    }

    if (lastSavedDataRef.current === dataSignature) {
      return;
    }

    let active = true;

    async function autoSave(): Promise<{ error?: string }> {
      await Promise.resolve();

      if (!active) {
        return {};
      }

      try {
        const request = draftSaveQueue.current.then(() => {
          if (!active) {
            return null;
          }

          return updateEnrollmentDraftAction(targetApplicationId, { data: JSON.parse(dataSignature) as EnrollmentApplicationData }).then(
            unwrapEnrollmentResult,
          );
        });

        draftSaveQueue.current = request.then(
          () => undefined,
          () => undefined,
        );

        const updated = await request;

        if (active && updated) {
          lastSavedDataRef.current = dataSignature;
          setApplication((prev) => (prev ? { ...prev, updatedAt: updated.updatedAt } : updated));
        }
      } catch (err: unknown) {
        if (active) {
          return {
            error: err instanceof Error ? err.message : ENROLLMENT_MESSAGES.DRAFT_SAVE_FAILED,
          };
        }
      }

      return {};
    }

    startTransition(() => saveDraft(autoSave));

    return () => {
      active = false;
    };
  }, [autosaveTarget, debouncedSignature, saveDraft, setApplication]);

  return { saving, saveError: autosaveState.error, draftSaveQueue };
}
