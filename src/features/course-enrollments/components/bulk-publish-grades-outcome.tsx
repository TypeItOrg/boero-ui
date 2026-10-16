"use client";

import type { ReactElement } from "react";

import { CircleAlertIcon } from "lucide-react";

import { Alert, AlertDescription } from "@common/components/ui/alert";
import { Button } from "@common/components/ui/button";

import type { BulkPublishClassResult, BulkPublishResult } from "@features/course-enrollments/actions/publish-bulk-grades.actions";

type BulkPublishOutcomeProps = {
  state: BulkPublishResult;
  classLabels: Record<string, string>;
  totalClasses: number;
  isRefreshing: boolean;
  refreshError: string | null;
  onRefreshPendingClasses: () => void;
};

function entryDetail(result: BulkPublishClassResult): string {
  if (result.status === "published") {
    const publishedGrades = result.publishedGrades ?? 0;

    const deletedGrades = result.deletedGrades ?? 0;

    const parts = [`${publishedGrades} ${publishedGrades === 1 ? "nota publicada" : "notas publicadas"}`];

    if (deletedGrades > 0) {
      parts.push(`${deletedGrades} ${deletedGrades === 1 ? "nota eliminada" : "notas eliminadas"}`);
    }

    return `Publicada — ${parts.join(" y ")}`;
  }

  if (result.status === "failed") {
    return `Falló — ${result.error ?? "La clase no se pudo publicar."}`;
  }

  return `Sin confirmar — ${result.error ?? "No se pudo confirmar la publicación. Verificá el estado antes de reintentar."}`;
}

export function BulkPublishOutcome({
  state,
  classLabels,
  totalClasses,
  isRefreshing,
  refreshError,
  onRefreshPendingClasses,
}: BulkPublishOutcomeProps): ReactElement {
  const results = state.results ?? [];

  const confirmed = results.filter((result) => result.status === "published").length;

  return (
    <>
      {state.error ? (
        <Alert variant="destructive">
          <CircleAlertIcon />
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      ) : null}
      {results.length > 0 ? (
        <Alert variant={confirmed < totalClasses ? "destructive" : "default"}>
          <CircleAlertIcon />
          <AlertDescription>
            <span className="block font-semibold">
              Se publicaron {confirmed} de {totalClasses} clases.
            </span>
            Cada clase se publica de forma independiente: lo confirmado no se revierte si otra clase falla.
          </AlertDescription>
        </Alert>
      ) : null}
      {results.length > 0 ? (
        <ul className="max-h-56 space-y-1 overflow-y-auto text-sm">
          {results.map((result) => (
            <li key={result.classId} className="flex flex-wrap gap-1">
              <span className="font-medium">{classLabels[result.classId] ?? result.classId}</span>
              <span className="text-muted-foreground">— {entryDetail(result)}</span>
            </li>
          ))}
        </ul>
      ) : null}
      {results.length > 0 ? (
        <div className="flex flex-wrap items-center gap-2">
          <Button type="button" variant="outline" size="sm" disabled={isRefreshing} onClick={onRefreshPendingClasses}>
            Actualizar clases con cambios
          </Button>
          {isRefreshing ? (
            <span className="text-muted-foreground text-sm" role="status">
              Actualizando clases con cambios…
            </span>
          ) : null}
        </div>
      ) : null}
      {refreshError ? (
        <Alert variant="destructive">
          <CircleAlertIcon />
          <AlertDescription>{refreshError}</AlertDescription>
        </Alert>
      ) : null}
    </>
  );
}
