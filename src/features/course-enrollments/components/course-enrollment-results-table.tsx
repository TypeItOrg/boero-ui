"use client";

import type { ReactElement } from "react";

import { EllipsisVerticalIcon } from "lucide-react";

import { ReturnToLink } from "@common/components/navigation/return-to-link";
import { OptionalValue } from "@common/components/optional-value";
import { Badge } from "@common/components/ui/badge";
import { Button } from "@common/components/ui/button";
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuSeparator, ContextMenuTrigger } from "@common/components/ui/context-menu";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@common/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableRow } from "@common/components/ui/table";

import { formatStudyPlanLabel } from "@features/academic/utils/study-plan-label.util";
import { CourseEnrollmentSchedules } from "@features/course-enrollments/components/course-enrollment-schedules";
import { CourseEnrollmentTableHeader } from "@features/course-enrollments/components/course-enrollment-table-header";
import { COURSE_ENROLLMENT_GRADE_MESSAGES } from "@features/course-enrollments/constants/course-enrollment-grade.constants";
import type { CourseEnrollmentResultsTableProps } from "@features/course-enrollments/types/course-enrollment-results-table-props.types";
import { getCourseEnrollmentSituationLabel } from "@features/course-enrollments/utils/course-enrollment-situation.util";
import { INSTITUTIONAL_PERMISSION as P } from "@features/institutional-auth/types/institutional-permission.types";
import { scopeIncludesTrainingPath } from "@features/institutional-auth/utils/institutional-permission.util";

export function CourseEnrollmentResultsTable({
  showActionsColumn,
  data,
  canWithdraw,
  permissionScopes,
  canUpdateAcademicStatus,
  detailBasePath,
  setMutation,
  gradeMode,
  canReadGrades,
  setGradeEnrollment,
}: CourseEnrollmentResultsTableProps): ReactElement {
  return (
    <Table className="min-w-192">
      <CourseEnrollmentTableHeader showActionsColumn={showActionsColumn} />
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

          const canViewGrades =
            canReadGrades &&
            (gradeMode === "teacher" || scopeIncludesTrainingPath(permissionScopes, P.COURSE_ENROLLMENT_GRADE_READ, enrollment.trainingPathId));

          const hasActions = Boolean(detailBasePath) || canWithdrawEnrollment || canUpdateResult || canViewGrades;

          function renderActions(
            Item: typeof DropdownMenuItem | typeof ContextMenuItem,
            Separator: typeof DropdownMenuSeparator | typeof ContextMenuSeparator,
          ): ReactElement {
            const hasActionBeforeWithdrawal = Boolean(detailBasePath) || canUpdateResult || canViewGrades;

            return (
              <>
                {detailBasePath ? (
                  <Item asChild>
                    <ReturnToLink href={`${detailBasePath}/${enrollment.id}`} className="px-2.5 py-1.5">
                      Ver detalle
                    </ReturnToLink>
                  </Item>
                ) : null}
                {canViewGrades && gradeMode ? (
                  <Item className="px-2.5 py-1.5" onSelect={() => setGradeEnrollment(enrollment)}>
                    {COURSE_ENROLLMENT_GRADE_MESSAGES.VIEW_GRADES}
                  </Item>
                ) : null}
                {canUpdateResult ? (
                  <Item className="px-2.5 py-1.5" onSelect={() => setMutation({ enrollment, mode: "academic" })}>
                    Registrar resultado
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
                <div>{formatStudyPlanLabel(enrollment)}</div>
                <div className="text-muted-foreground">{enrollment.academicLevelName ?? "Sin nivel"}</div>
              </TableCell>
              <TableCell>
                <OptionalValue value={enrollment.instrumentName} fallback="Sin instrumento" />
              </TableCell>
              <TableCell>
                <CourseEnrollmentSchedules schedules={enrollment.schedules} />
              </TableCell>
              <TableCell>
                <Badge variant={enrollment.status === "ENROLLED" ? "success" : "secondary"}>
                  {getCourseEnrollmentSituationLabel(enrollment.status, enrollment.academicStatus)}
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
  );
}
