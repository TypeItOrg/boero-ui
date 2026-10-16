"use client";

import { useCallback, useEffect, useState } from "react";
import type { ReactElement } from "react";

import { useRouter } from "next/navigation";

import { Loader2Icon } from "lucide-react";

import { Button } from "@common/components/ui/button";

import { PublishGradesDialog } from "@features/course-enrollments/components/publish-grades-dialog";
import {
  fetchClassPendingSummaryClient,
  fetchTeacherPendingSummaryClient,
} from "@features/course-enrollments/services/course-enrollment-grade-client.service";
import type { PendingGradesSummary } from "@features/course-enrollments/types/pending-grades-summary.types";
import { notifyGradesChanged, useGradesChangedListener } from "@features/course-enrollments/utils/course-enrollment-grade-events.util";

type PublishGradesButtonProps = {
  classId: string;
  mode: "institutional" | "teacher";
  label?: string;
};

export function PublishGradesButton({ classId, mode, label }: PublishGradesButtonProps): ReactElement {
  const router = useRouter();

  const [summary, setSummary] = useState<PendingGradesSummary | null>(null);

  const [isLoading, setIsLoading] = useState(true);

  const [isOpen, setIsOpen] = useState(false);

  const refresh = useCallback(async () => {
    setIsLoading(true);

    try {
      if (mode === "teacher") {
        setSummary(await fetchTeacherPendingSummaryClient(classId));
      } else {
        setSummary(await fetchClassPendingSummaryClient(classId));
      }
    } catch {
      setSummary(null);
    } finally {
      setIsLoading(false);
    }
  }, [classId, mode]);

  useEffect(() => {
    let cancelled = false;

    const request = mode === "teacher" ? fetchTeacherPendingSummaryClient(classId) : fetchClassPendingSummaryClient(classId);

    request
      .then((data) => {
        if (!cancelled) {
          setSummary(data);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setSummary(null);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setIsLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [classId, mode]);

  useGradesChangedListener(
    useCallback(() => {
      void refresh();
    }, [refresh]),
  );

  const pending = summary?.pendingChanges ?? 0;

  if (isLoading) {
    return (
      <Button size="lg" disabled aria-busy="true">
        <span className="sr-only" role="status">
          Cargando cambios pendientes…
        </span>
        <span aria-hidden="true" className="inline-flex items-center gap-2">
          <Loader2Icon className="size-4 animate-spin" aria-hidden="true" />
          Cargando…
        </span>
      </Button>
    );
  }

  return (
    <>
      <Button size="lg" onClick={() => setIsOpen(true)} disabled={pending === 0}>
        {label ?? "Publicar notas"}
        {pending > 0 ? ` (${pending})` : ""}
      </Button>
      <PublishGradesDialog
        classId={classId}
        mode={mode}
        summary={summary}
        open={isOpen}
        onOpenChange={setIsOpen}
        onPublished={() => {
          void refresh();
          notifyGradesChanged();
          router.refresh();
        }}
        label={label}
      />
    </>
  );
}
