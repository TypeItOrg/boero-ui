import type { ReactElement } from "react";

import { HistoryIcon } from "lucide-react";

import { OptionalValue } from "@common/components/optional-value";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@common/components/ui/table";

import { SectionHeader } from "@features/course-enrollments/components/course-enrollment-detail-items";
import { HistoryStatus } from "@features/course-enrollments/components/course-enrollment-history-status";
import {
  ACADEMIC_ENROLLMENT_STATUS_LABELS,
  COURSE_ENROLLMENT_OPERATION_LABELS,
  COURSE_ENROLLMENT_STATUS_LABELS,
} from "@features/course-enrollments/constants/course-enrollment.constants";
import type { CourseEnrollmentHistory } from "@features/course-enrollments/types/course-enrollment-history.types";
import { formatEnrollmentApplicationDateTime } from "@features/enrollment-applications/utils/enrollment-application-date.util";

export function CourseEnrollmentHistorySection({ history }: { history: CourseEnrollmentHistory[] }): ReactElement {
  return (
    <section aria-labelledby="enrollment-history-title" className="bg-muted/25 min-w-0 rounded-xl border p-5 md:p-6">
      <SectionHeader
        id="enrollment-history-title"
        icon={HistoryIcon}
        title="Historial"
        description="Registro de operaciones, cambios de estado y resultados académicos."
      />
      <div className="mt-5">
        {history.length === 0 ? (
          <p className="text-muted-foreground text-sm">No hay movimientos históricos.</p>
        ) : (
          <div className="bg-background overflow-hidden rounded-lg border">
            <Table containerClassName="table-scrollbar" className="min-w-180">
              <TableHeader className="bg-muted">
                <TableRow className="h-11">
                  <TableHead>Fecha</TableHead>
                  <TableHead>Operación</TableHead>
                  <TableHead>Cursada</TableHead>
                  <TableHead>Resultado</TableHead>
                  <TableHead>Motivo</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {history.map((item) => (
                  <TableRow key={item.id} className="h-12">
                    <TableCell className="tabular-nums">
                      <time dateTime={item.changedAt}>{formatEnrollmentApplicationDateTime(item.changedAt)}</time>
                    </TableCell>
                    <TableCell>{COURSE_ENROLLMENT_OPERATION_LABELS[item.operation] ?? "Actualización de cursada"}</TableCell>
                    <TableCell>
                      <HistoryStatus
                        previous={item.previousStatus ? COURSE_ENROLLMENT_STATUS_LABELS[item.previousStatus] : null}
                        current={item.newStatus ? COURSE_ENROLLMENT_STATUS_LABELS[item.newStatus] : null}
                      />
                    </TableCell>
                    <TableCell>
                      <HistoryStatus
                        previous={item.previousAcademicStatus ? ACADEMIC_ENROLLMENT_STATUS_LABELS[item.previousAcademicStatus] : null}
                        current={item.newAcademicStatus ? ACADEMIC_ENROLLMENT_STATUS_LABELS[item.newAcademicStatus] : null}
                      />
                    </TableCell>
                    <TableCell className="max-w-80 min-w-40 break-words whitespace-pre-wrap">
                      <OptionalValue value={item.reason} fallback="Sin motivo informado" />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </section>
  );
}
