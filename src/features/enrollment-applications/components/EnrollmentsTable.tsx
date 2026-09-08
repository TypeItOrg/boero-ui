"use client";

import * as React from "react";
import { EyeIcon, FileTextIcon } from "lucide-react";
import { Button } from "@common/components/ui/button";
import { ReturnToLink } from "@common/components/navigation/return-to-link";
import { useDataTableNavigation } from "@common/components/ui/data-table-navigation";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@common/components/ui/table";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@common/components/ui/empty";
import type { PaginatedResponse } from "@common/types/paginated-response.types";
import type { EnrollmentApplicationResponse } from "../types/enrollment-application.types";
import { EnrollmentStatusBadge } from "./EnrollmentStatusBadge";
import { EnrollmentsPagination } from "./EnrollmentsPagination";
import { formatApplicationDate, getApplicantDni, getApplicantFullName } from "../utils/enrollment-application.util";

interface EnrollmentsTableProps {
  data: PaginatedResponse<EnrollmentApplicationResponse>;
  page: number;
  size: number;
  studyPlansMap?: Record<string, string>;
  academicYearsMap?: Record<string, string>;
}

export function EnrollmentsTable({ data, page, size, studyPlansMap = {}, academicYearsMap = {} }: EnrollmentsTableProps): React.ReactElement {
  const { isPending: isNavigating } = useDataTableNavigation();

  if (data.items.length === 0) {
    return (
      <Empty className="bg-muted/10 border py-12">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <FileTextIcon className="text-muted-foreground size-6" />
          </EmptyMedia>
          <EmptyTitle>No se encontraron solicitudes</EmptyTitle>
          <EmptyDescription>No hay inscripciones registradas que coincidan con los criterios de búsqueda o filtros seleccionados.</EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div
        className="relative overflow-hidden rounded-lg border transition-opacity"
        aria-busy={isNavigating}
        style={{ opacity: isNavigating ? 0.6 : 1 }}
      >
        <Table containerClassName="table-scrollbar" className="min-w-190">
          <TableHeader className="bg-muted/50 sticky top-0 z-10 [&_tr]:border-b">
            <TableRow className="hover:bg-muted/50 h-11 border-b">
              <TableHead className="font-semibold">Estudiante</TableHead>
              <TableHead className="font-semibold">Plan de Estudio</TableHead>
              <TableHead className="font-semibold">Ciclo Lectivo</TableHead>
              <TableHead className="font-semibold">Estado</TableHead>
              <TableHead className="font-semibold">Fecha</TableHead>
              <TableHead className="text-right font-semibold">
                <span className="sr-only">Acciones</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.items.map((application) => {
              const fullName = getApplicantFullName(application);
              const dni = getApplicantDni(application);
              const studyPlanName = application.studyPlanName || studyPlansMap[application.studyPlanId] || "Plan general";
              const academicYearName = application.academicYearName || academicYearsMap[application.academicYearId] || "Ciclo no asignado";
              const dateDisplay = formatApplicationDate(application.submittedAt || application.createdAt);

              return (
                <TableRow key={application.applicationId} className="hover:bg-muted/50 transition-colors">
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="text-foreground font-medium">{fullName}</span>
                      <span className="text-muted-foreground text-xs">{dni !== "—" ? `DNI ${dni}` : "Sin DNI registrado"}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-foreground/90 text-sm font-medium">{studyPlanName}</span>
                  </TableCell>
                  <TableCell>
                    <span className="text-muted-foreground text-sm">{academicYearName}</span>
                  </TableCell>
                  <TableCell>
                    <EnrollmentStatusBadge status={application.status} />
                  </TableCell>
                  <TableCell>
                    <span className="text-muted-foreground text-sm">{dateDisplay}</span>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button asChild variant="outline" size="sm">
                      <ReturnToLink href={`/enrollments/${application.applicationId}`}>
                        <EyeIcon data-icon="inline-start" className="size-4" />
                        Ver detalle
                      </ReturnToLink>
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <EnrollmentsPagination page={page} size={size} totalItems={data.totalItems} totalPages={data.totalPages} />
    </div>
  );
}
