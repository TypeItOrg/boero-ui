"use client";

import Link from "next/link";
import { scopeIncludesTrainingPath } from "@features/institutional-auth/utils/institutional-permission.util";
import { INSTITUTIONAL_PERMISSION as P } from "@features/institutional-auth/types/institutional-permission.types";
import { ReturnToLink } from "@common/components/navigation/return-to-link";
import * as React from "react";
import { useRouter } from "next/navigation";
import { EllipsisVerticalIcon, SearchIcon } from "lucide-react";

import { Button } from "@common/components/ui/button";
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuSeparator, ContextMenuTrigger } from "@common/components/ui/context-menu";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@common/components/ui/dropdown-menu";
import { Badge } from "@common/components/ui/badge";
import { useDataTableNavigation } from "@common/components/ui/data-table-navigation";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@common/components/ui/empty";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@common/components/ui/table";
import type { PaginatedResponse } from "@common/types/paginated-response.types";
import type { CourseEnrollment } from "@features/course-enrollments/types/course-enrollment.types";
import type { AcademicEnrollmentStatus } from "@features/course-enrollments/types/academic-enrollment-status.types";
import type { CourseEnrollmentStatus } from "@features/course-enrollments/types/course-enrollment-status.types";
import { CourseEnrollmentMutationDialog } from "@features/course-enrollments/components/course-enrollment-mutation-dialog";
import { CourseEnrollmentSchedules } from "@features/course-enrollments/components/course-enrollment-schedules";
import { CourseEnrollmentPagination } from "@features/course-enrollments/components/course-enrollment-pagination";
import {
  ACADEMIC_ENROLLMENT_STATUS_LABELS,
  COURSE_ENROLLMENT_STATUS_LABELS,
} from "@features/course-enrollments/constants/course-enrollment.constants";
import { ScrollTextIcon } from "lucide-react";

type CourseEnrollmentTableProps = {
  permissionScopes?: import("@features/institutional-auth/types/institutional-user.types").InstitutionalUser["permissionScopes"];
  data: PaginatedResponse<CourseEnrollment>;
  page: number;
  size: number;
  status?: CourseEnrollmentStatus;
  academicStatus?: AcademicEnrollmentStatus;
  emptyMessage: string;
  canWithdraw?: boolean;
  canUpdateAcademicStatus?: boolean;
  canReadWaitlist?: boolean;
  detailBasePath?: string;
};

export function CourseEnrollmentTable({
  data,
  permissionScopes,
  page,
  size,
  status,
  academicStatus,
  emptyMessage,
  canWithdraw = false,
  canUpdateAcademicStatus = false,
  canReadWaitlist = false,
  detailBasePath,
}: CourseEnrollmentTableProps): React.ReactElement {
  const router = useRouter();
  const { isPending: isNavigating } = useDataTableNavigation();
  const [mutation, setMutation] = React.useState<{ enrollment: CourseEnrollment; mode: "withdraw" | "academic" }>();
  const hasFilters = status !== undefined || academicStatus !== undefined;
  const showActionsColumn = Boolean(detailBasePath) || canReadWaitlist || canWithdraw || canUpdateAcademicStatus;

  if (data.items.length === 0) {
    return (
      <div className="flex h-full flex-col gap-4">
        <div className="relative h-full overflow-hidden rounded-lg border" aria-busy={isNavigating}>
          <Empty className="min-h-56 p-6">
            <EmptyHeader className="max-w-sm">
              <EmptyMedia variant="icon">
                {hasFilters ? <SearchIcon className="size-5" aria-hidden="true" /> : <ScrollTextIcon className="size-5" aria-hidden="true" />}
              </EmptyMedia>
              <EmptyTitle className="text-base">{hasFilters ? "No se encontraron cursadas" : emptyMessage}</EmptyTitle>
              <EmptyDescription>
                {hasFilters
                  ? "No encontramos ninguna cursada que coincida con los filtros seleccionados."
                  : "Las cursadas registradas van a aparecer acá junto con sus horarios, estado y resultado académico."}
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
          {isNavigating && (
            <div className="bg-background/55 absolute inset-0 z-20 flex items-center justify-center backdrop-blur-[1px]">
              <span className="sr-only" role="status" aria-live="polite">
                Cargando cursadas
              </span>
            </div>
          )}
        </div>

        <CourseEnrollmentPagination page={page} size={size} totalItems={data.totalItems} totalPages={data.totalPages} />
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col gap-4">
      <div className="relative h-full overflow-hidden rounded-lg border" aria-busy={isNavigating}>
        <Table containerClassName="table-scrollbar" className="min-w-192">
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
              <TableHead>Cursada</TableHead>
              <TableHead>Resultado</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.items.map((enrollment) => {
              const canWithdrawEnrollment =
                canWithdraw &&
                scopeIncludesTrainingPath(permissionScopes, P.COURSE_ENROLLMENT_WITHDRAW, enrollment.trainingPathId) &&
                enrollment.status === "ENROLLED";
              const canUpdateResult =
                canUpdateAcademicStatus &&
                scopeIncludesTrainingPath(permissionScopes, P.COURSE_ENROLLMENT_ACADEMIC_STATUS_UPDATE, enrollment.trainingPathId) &&
                enrollment.status !== "WITHDRAWN" &&
                enrollment.status !== "ADMINISTRATIVELY_WITHDRAWN";
              const canViewWaitlist =
                canReadWaitlist && scopeIncludesTrainingPath(permissionScopes, P.COURSE_WAITLIST_READ, enrollment.trainingPathId);
              const hasActions = Boolean(detailBasePath) || canViewWaitlist || canWithdrawEnrollment || canUpdateResult;

              function renderActions(
                Item: typeof DropdownMenuItem | typeof ContextMenuItem,
                Separator: typeof DropdownMenuSeparator | typeof ContextMenuSeparator,
              ): React.ReactElement {
                const hasActionBeforeWithdrawal = Boolean(detailBasePath) || canViewWaitlist || canUpdateResult;

                return (
                  <>
                    {detailBasePath ? (
                      <Item asChild>
                        <ReturnToLink href={`${detailBasePath}/${enrollment.id}`} className="px-2.5 py-1.5">
                          Ver detalle
                        </ReturnToLink>
                      </Item>
                    ) : null}
                    {canViewWaitlist ? (
                      <Item asChild>
                        <Link href={`/course-enrollments/${enrollment.courseId}/waitlist`} className="px-2.5 py-1.5">
                          Ver lista de espera
                        </Link>
                      </Item>
                    ) : null}
                    {canUpdateResult ? (
                      <Item className="px-2.5 py-1.5" onSelect={() => setMutation({ enrollment, mode: "academic" })}>
                        Actualizar estado académico
                      </Item>
                    ) : null}
                    {canWithdrawEnrollment ? (
                      <>
                        {hasActionBeforeWithdrawal ? <Separator /> : null}
                        <Item variant="destructive" className="px-2.5 py-1.5" onSelect={() => setMutation({ enrollment, mode: "withdraw" })}>
                          Registrar baja
                        </Item>
                      </>
                    ) : null}
                  </>
                );
              }

              const row = (
                <TableRow key={enrollment.id} className="hover:bg-muted/50 h-12 border-b transition-colors">
                  {showActionsColumn ? (
                    <TableCell className="w-16 pl-4">
                      {hasActions ? (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" aria-label={`Abrir acciones de ${enrollment.studentName}`}>
                              <EllipsisVerticalIcon />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="start" className="w-56 p-1.5">
                            {renderActions(DropdownMenuItem, DropdownMenuSeparator)}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      ) : null}
                    </TableCell>
                  ) : null}
                  <TableCell className={showActionsColumn ? undefined : "pl-4"}>{enrollment.studentName}</TableCell>
                  <TableCell className="font-medium">
                    {enrollment.academicSpaceName}
                    <div className="text-muted-foreground text-sm">{enrollment.courseClassLabel}</div>
                  </TableCell>
                  <TableCell>
                    <div>{enrollment.studyPlanName}</div>
                    <div className="text-muted-foreground">{enrollment.academicLevelName ?? "Sin nivel"}</div>
                  </TableCell>
                  <TableCell>{enrollment.instrumentName ?? "—"}</TableCell>
                  <TableCell>
                    <CourseEnrollmentSchedules schedules={enrollment.schedules} />
                  </TableCell>
                  <TableCell>
                    <Badge variant={enrollment.status === "ENROLLED" ? "success" : "secondary"}>
                      {COURSE_ENROLLMENT_STATUS_LABELS[enrollment.status]}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={enrollment.academicStatus === "IN_PROGRESS" ? "outline" : "secondary"}>
                      {ACADEMIC_ENROLLMENT_STATUS_LABELS[enrollment.academicStatus]}
                    </Badge>
                  </TableCell>
                </TableRow>
              );

              if (!hasActions) {
                return row;
              }

              return (
                <ContextMenu key={enrollment.id}>
                  <ContextMenuTrigger asChild>{row}</ContextMenuTrigger>
                  <ContextMenuContent className="w-56 p-1.5">{renderActions(ContextMenuItem, ContextMenuSeparator)}</ContextMenuContent>
                </ContextMenu>
              );
            })}
          </TableBody>
        </Table>

        {isNavigating && (
          <div className="bg-background/55 absolute inset-0 z-20 flex items-center justify-center backdrop-blur-[1px]">
            <span className="sr-only" role="status" aria-live="polite">
              Cargando cursadas
            </span>
          </div>
        )}
      </div>

      <CourseEnrollmentPagination page={page} size={size} totalItems={data.totalItems} totalPages={data.totalPages} />

      {mutation ? (
        <CourseEnrollmentMutationDialog
          enrollment={mutation.enrollment}
          mode={mutation.mode}
          open
          onOpenChange={(open) => {
            if (!open) {
              setMutation(undefined);
            }
          }}
          onUpdated={() => router.refresh()}
        />
      ) : null}
    </div>
  );
}
