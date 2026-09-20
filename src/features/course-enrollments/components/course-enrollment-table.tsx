"use client";

import Link from "next/link";
import * as React from "react";
import { useRouter } from "next/navigation";
import { SearchIcon } from "lucide-react";

import { Button } from "@common/components/ui/button";
import { Badge } from "@common/components/ui/badge";
import { useDataTableNavigation } from "@common/components/ui/data-table-navigation";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@common/components/ui/empty";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@common/components/ui/table";
import type { PaginatedResponse } from "@common/types/paginated-response.types";
import type { CourseEnrollment } from "@features/course-enrollments/types/course-enrollment.types";
import type { AcademicEnrollmentStatus } from "@features/course-enrollments/types/academic-enrollment-status.types";
import type { CourseEnrollmentStatus } from "@features/course-enrollments/types/course-enrollment-status.types";
import { CourseEnrollmentMutationDialog } from "@features/course-enrollments/components/course-enrollment-mutation-dialog";
import { CourseEnrollmentPagination } from "@features/course-enrollments/components/course-enrollment-pagination";
import {
  ACADEMIC_ENROLLMENT_STATUS_LABELS,
  COURSE_DAY_LABELS,
  COURSE_ENROLLMENT_STATUS_LABELS,
} from "@features/course-enrollments/constants/course-enrollment.constants";
import { ScrollTextIcon } from "lucide-react";

type CourseEnrollmentTableProps = {
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
                  : "Cuando te inscribas en un curso, tu cursada va a aparecer acá junto con su estado y resultado."}
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
              <TableHead>Estudiante</TableHead>
              <TableHead>Curso / clase</TableHead>
              <TableHead>Plan / nivel</TableHead>
              <TableHead>Instrumento</TableHead>
              <TableHead>Horarios</TableHead>
              <TableHead>Cursada</TableHead>
              <TableHead>Resultado</TableHead>
              <TableHead>Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.items.map((enrollment) => (
              <TableRow key={enrollment.id} className="hover:bg-muted/50 h-11 border-b transition-colors">
                <TableCell>{enrollment.studentName}</TableCell>
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
                  {enrollment.schedules.length === 0
                    ? "—"
                    : enrollment.schedules
                        .map(
                          (schedule) =>
                            `${COURSE_DAY_LABELS[schedule.dayOfWeek] ?? schedule.dayOfWeek} ${schedule.startTime.slice(0, 5)}–${schedule.endTime.slice(0, 5)}${schedule.releasedAt ? " (liberado)" : ""}`,
                        )
                        .join(", ")}
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
                <TableCell>
                  <div className="flex min-w-44 flex-wrap gap-2">
                    {detailBasePath ? (
                      <Button asChild variant="outline" size="sm">
                        <Link href={`${detailBasePath}/${enrollment.id}`}>Ver detalle</Link>
                      </Button>
                    ) : null}
                    {canReadWaitlist ? (
                      <Button asChild variant="outline" size="sm">
                        <Link href={`/course-enrollments/${enrollment.courseId}/waitlist`}>Ver lista de espera</Link>
                      </Button>
                    ) : null}
                    {canWithdraw && enrollment.status === "ENROLLED" ? (
                      <Button variant="outline" size="sm" onClick={() => setMutation({ enrollment, mode: "withdraw" })}>
                        Registrar baja
                      </Button>
                    ) : null}
                    {canUpdateAcademicStatus && enrollment.status !== "WITHDRAWN" && enrollment.status !== "ADMINISTRATIVELY_WITHDRAWN" ? (
                      <Button variant="outline" size="sm" onClick={() => setMutation({ enrollment, mode: "academic" })}>
                        Resultado
                      </Button>
                    ) : null}
                  </div>
                </TableCell>
              </TableRow>
            ))}
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
