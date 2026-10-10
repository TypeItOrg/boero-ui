"use client";

import type { ReactElement } from "react";

import { TableHead, TableHeader, TableRow } from "@common/components/ui/table";

import type { AcademicScope } from "@features/academic/utils/academic-scope.util";

export function DocumentCatalogTableHeader({ scope }: { scope: AcademicScope }): ReactElement {
  return (
    <TableHeader className="bg-muted sticky top-0 z-10 [&_tr]:border-b">
      <TableRow>
        <TableHead className="w-16 pl-4">
          <span className="sr-only">Acciones</span>
        </TableHead>
        <TableHead>Documento</TableHead>
        {scope === "admin" ? <TableHead>Institución</TableHead> : null}
        <TableHead>Formatos</TableHead>
        <TableHead>Estado</TableHead>
      </TableRow>
    </TableHeader>
  );
}
