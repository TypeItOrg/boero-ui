"use client";

import type { ReactElement } from "react";

import { TableHead, TableHeader, TableRow } from "@common/components/ui/table";

export function CourseEnrollmentTableHeader({ showActionsColumn }: { showActionsColumn: boolean }): ReactElement {
  return (
    <TableHeader className="bg-muted sticky top-0 z-10 [&_tr]:border-b">
      <TableRow className="hover:bg-muted/50 data-[state=selected]:bg-muted h-11 border-b transition-colors">
        {showActionsColumn ? (
          <TableHead className="w-16 pl-4">
            <span className="sr-only">Acciones</span>
          </TableHead>
        ) : null}
        <TableHead className={showActionsColumn ? undefined : "pl-4"}>Estudiante</TableHead>
        <TableHead>Curso</TableHead>
        <TableHead>Plan</TableHead>
        <TableHead>Instrumento</TableHead>
        <TableHead>Horarios</TableHead>
        <TableHead>Situación</TableHead>
      </TableRow>
    </TableHeader>
  );
}
