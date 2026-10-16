"use client";

import type { ReactElement } from "react";

import { CircleAlertIcon, ScrollTextIcon } from "lucide-react";

import { Alert, AlertDescription } from "@common/components/ui/alert";
import { Button } from "@common/components/ui/button";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@common/components/ui/empty";
import { Skeleton } from "@common/components/ui/skeleton";

import { COURSE_ENROLLMENT_GRADE_MESSAGES } from "@features/course-enrollments/constants/course-enrollment-grade.constants";

export function GradeListSkeleton(): ReactElement {
  return (
    <div className="space-y-3" aria-busy="true" aria-label="Cargando notas">
      <span className="sr-only" role="status">
        Cargando notas…
      </span>
      {Array.from({ length: 3 }).map((_, index) => (
        <div key={index} className="space-y-2 rounded-lg border p-3">
          <div className="flex items-start justify-between gap-2">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-5 w-24 rounded-full" />
          </div>
          <Skeleton className="h-7 w-16" />
          <Skeleton className="h-3 w-48" />
        </div>
      ))}
    </div>
  );
}

export function GradeListError({ message, onRetry }: { message: string; onRetry?: () => void }): ReactElement {
  return (
    <div className="space-y-3">
      <Alert variant="destructive">
        <CircleAlertIcon />
        <AlertDescription>{message}</AlertDescription>
      </Alert>
      {onRetry ? (
        <Button type="button" variant="outline" size="sm" onClick={onRetry}>
          Reintentar
        </Button>
      ) : null}
    </div>
  );
}

export function GradeListEmpty(): ReactElement {
  return (
    <Empty className="min-h-56 p-6">
      <EmptyHeader className="max-w-sm">
        <EmptyMedia variant="icon">
          <ScrollTextIcon className="size-5" aria-hidden="true" />
        </EmptyMedia>
        <EmptyTitle className="text-base">Todavía no hay notas cargadas</EmptyTitle>
        <EmptyDescription>{COURSE_ENROLLMENT_GRADE_MESSAGES.NO_GRADES}</EmptyDescription>
      </EmptyHeader>
    </Empty>
  );
}
