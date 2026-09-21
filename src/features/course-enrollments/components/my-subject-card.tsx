import { ClockIcon, Music2Icon } from "lucide-react";

import { Badge } from "@common/components/ui/badge";
import { Button } from "@common/components/ui/button";
import {
  ACADEMIC_ENROLLMENT_STATUS_LABELS,
  COURSE_DAY_LABELS,
  COURSE_ENROLLMENT_STATUS_LABELS,
} from "@features/course-enrollments/constants/course-enrollment.constants";
import { MY_SUBJECTS_MESSAGES } from "@features/course-enrollments/constants/my-subjects.constants";
import { ACADEMIC_ENROLLMENT_STATUS } from "@features/course-enrollments/types/academic-enrollment-status.types";
import { COURSE_ENROLLMENT_STATUS } from "@features/course-enrollments/types/course-enrollment-status.types";
import type { CourseEnrollment } from "@features/course-enrollments/types/course-enrollment.types";

type MySubjectCardProps = {
  enrollment: CourseEnrollment;
  canWithdraw: boolean;
  canUpdateAcademicStatus: boolean;
  onMutation: (enrollment: CourseEnrollment, mode: "withdraw" | "academic") => void;
};

export function MySubjectCard({ enrollment, canWithdraw, canUpdateAcademicStatus, onMutation }: MySubjectCardProps): React.ReactElement {
  const isEnrolled = enrollment.status === COURSE_ENROLLMENT_STATUS.ENROLLED;
  const isWithdrawn =
    enrollment.status === COURSE_ENROLLMENT_STATUS.WITHDRAWN || enrollment.status === COURSE_ENROLLMENT_STATUS.ADMINISTRATIVELY_WITHDRAWN;
  const showWithdraw = canWithdraw && isEnrolled;
  const showAcademicAction = canUpdateAcademicStatus && !isWithdrawn;
  const showResult = enrollment.academicStatus !== ACADEMIC_ENROLLMENT_STATUS.IN_PROGRESS;
  const days = Object.keys(COURSE_DAY_LABELS);
  const schedules = enrollment.schedules
    .filter((schedule) => !isEnrolled || !schedule.releasedAt)
    .toSorted((a, b) => days.indexOf(a.dayOfWeek) - days.indexOf(b.dayOfWeek) || a.startTime.localeCompare(b.startTime));
  const context = [enrollment.trainingPathName, enrollment.studyPlanName, enrollment.academicLevelName].filter(Boolean).join(" · ");

  return (
    <article className="bg-muted/25 @container/subject flex min-w-0 flex-col overflow-hidden rounded-xl border">
      <div className="grid flex-1 content-start gap-4 p-4 @xl/subject:grid-cols-[minmax(0,1fr)_minmax(0,0.8fr)] @xl/subject:gap-6">
        <div className="flex min-w-0 flex-col gap-2">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 space-y-1">
              <h2 className="text-lg leading-snug font-semibold tracking-tight wrap-break-word">{enrollment.academicSpaceName}</h2>
            </div>
            <Badge variant={isEnrolled ? "success" : "secondary"} className="mt-1 shrink-0">
              {COURSE_ENROLLMENT_STATUS_LABELS[enrollment.status]}
            </Badge>
          </div>
          <div className="text-muted-foreground flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
            {context ? <p className="wrap-break-word">{context}</p> : null}
            {enrollment.instrumentName ? (
              <span className="text-primary inline-flex items-center gap-1.5 font-medium">
                <Music2Icon className="size-3.5 shrink-0" aria-hidden="true" />
                {enrollment.instrumentName}
              </span>
            ) : null}
          </div>
          <dl className="grid min-w-0 gap-1.5 text-sm">
            <div className="flex flex-wrap gap-x-2 gap-y-0.5">
              <dt className="text-muted-foreground">{MY_SUBJECTS_MESSAGES.CLASS}:</dt>
              <dd className="min-w-0 wrap-break-word">{enrollment.courseClassLabel}</dd>
            </div>
            <div className="flex flex-wrap gap-x-2 gap-y-0.5">
              <dt className="text-muted-foreground">{MY_SUBJECTS_MESSAGES.TEACHERS}:</dt>
              <dd className="min-w-0 wrap-break-word">
                {enrollment.teachers?.length ? enrollment.teachers.map((teacher) => teacher.fullName).join(", ") : MY_SUBJECTS_MESSAGES.NO_TEACHERS}
              </dd>
            </div>
          </dl>
        </div>
        <div className="min-w-0 border-t pt-4 @xl/subject:border-t-0 @xl/subject:border-l @xl/subject:pt-0 @xl/subject:pl-6">
          <h3 className="text-muted-foreground mb-2 flex items-center gap-2 text-xs font-medium tracking-wider uppercase">
            <ClockIcon className="size-3.5" aria-hidden="true" />
            {isEnrolled ? "Horarios" : "Horarios de la cursada"}
          </h3>
          {schedules.length > 0 ? (
            <ul className="space-y-2">
              {schedules.map((schedule) => (
                <li key={schedule.id} className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 text-sm">
                  <span>
                    {COURSE_DAY_LABELS[schedule.dayOfWeek] ?? schedule.dayOfWeek}
                    {schedule.releasedAt ? <span className="text-muted-foreground"> · Horario liberado</span> : null}
                  </span>
                  <span className="font-medium tabular-nums">
                    {schedule.startTime.slice(0, 5)}–{schedule.endTime.slice(0, 5)}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-muted-foreground text-sm">
              {isEnrolled ? MY_SUBJECTS_MESSAGES.NO_CURRENT_SCHEDULES : MY_SUBJECTS_MESSAGES.NO_HISTORICAL_SCHEDULES}
            </p>
          )}
        </div>
      </div>
      {showResult ? (
        <div className="mt-auto flex flex-wrap items-center justify-between gap-2 border-t px-4 py-3">
          <span className="text-muted-foreground text-sm">Resultado académico</span>
          <Badge variant="outline">{ACADEMIC_ENROLLMENT_STATUS_LABELS[enrollment.academicStatus]}</Badge>
        </div>
      ) : null}
      {showWithdraw || showAcademicAction ? (
        <div className="flex flex-wrap gap-2 border-t px-4 py-3">
          {showWithdraw ? (
            <Button variant="outline" size="sm" onClick={() => onMutation(enrollment, "withdraw")}>
              Registrar baja
            </Button>
          ) : null}
          {showAcademicAction ? (
            <Button variant="outline" size="sm" onClick={() => onMutation(enrollment, "academic")}>
              Actualizar resultado
            </Button>
          ) : null}
        </div>
      ) : null}
    </article>
  );
}
