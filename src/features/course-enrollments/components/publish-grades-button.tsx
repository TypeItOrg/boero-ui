"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Loader2Icon } from "lucide-react";

import { Button } from "@common/components/ui/button";
import { PublishGradesDialog } from "@features/course-enrollments/components/publish-grades-dialog";
import { fetchClassPendingSummaryClient, fetchTeacherPendingSummaryClient } from "@features/course-enrollments/services/course-enrollment-grade-client.service";
import { notifyGradesChanged, useGradesChangedListener } from "@features/course-enrollments/utils/course-enrollment-grade-events.util";
import type { PendingGradesSummary } from "@features/course-enrollments/types/pending-grades-summary.types";

type PublishGradesButtonProps = {
  classId: string;
  mode: "institutional" | "teacher";
  label?: string;
};

export function PublishGradesButton({ classId, mode, label }: PublishGradesButtonProps): React.ReactElement {
  const router = useRouter();
  const [summary, setSummary] = React.useState<PendingGradesSummary | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isOpen, setIsOpen] = React.useState(false);

  const refresh = React.useCallback(async () => {
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

  React.useEffect(() => {
    void refresh();
  }, [refresh]);

  useGradesChangedListener(
    React.useCallback(() => {
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
