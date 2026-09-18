"use client";

import Link from "next/link";
import * as React from "react";
import { useRouter } from "next/navigation";

import { Button } from "@common/components/ui/button";
import type { CourseEnrollment } from "@features/course-enrollments/types/course-enrollment.types";
import { CourseEnrollmentMutationDialog } from "@features/course-enrollments/components/course-enrollment-mutation-dialog";
import { ACADEMIC_ENROLLMENT_STATUS_LABELS } from "@features/course-enrollments/constants/course-enrollment.constants";

type CourseEnrollmentTableProps = {
  items: CourseEnrollment[];
  emptyMessage: string;
  canWithdraw?: boolean;
  canUpdateAcademicStatus?: boolean;
  canReadWaitlist?: boolean;
  detailBasePath?: string;
};

const STATUS_LABELS: Record<CourseEnrollment["status"], string> = {
  ENROLLED: "En curso",
  COMPLETED: "Finalizada",
  WITHDRAWN: "Baja voluntaria",
  ADMINISTRATIVELY_WITHDRAWN: "Baja administrativa",
};

export function CourseEnrollmentTable({
  items,
  emptyMessage,
  canWithdraw = false,
  canUpdateAcademicStatus = false,
  canReadWaitlist = false,
  detailBasePath,
}: CourseEnrollmentTableProps): React.ReactElement {
  const router = useRouter();
  const [mutation, setMutation] = React.useState<{ enrollment: CourseEnrollment; mode: "withdraw" | "academic" }>();

  if (items.length === 0) {
    return <p className="text-muted-foreground rounded-lg border border-dashed p-8 text-center">{emptyMessage}</p>;
  }

  return (
    <div className="overflow-x-auto rounded-lg border">
      <table className="w-full min-w-192 text-sm">
        <thead className="bg-muted text-left">
          <tr>
            <th className="px-4 py-3">Curso</th>
            <th className="px-4 py-3">Plan / nivel</th>
            <th className="px-4 py-3">Instrumento</th>
            <th className="px-4 py-3">Horarios</th>
            <th className="px-4 py-3">Cursada</th>
            <th className="px-4 py-3">Resultado</th>
            <th className="px-4 py-3">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {items.map((enrollment) => (
            <tr key={enrollment.id} className="border-t align-top">
              <td className="px-4 py-3 font-medium">{enrollment.academicSpaceName}</td>
              <td className="px-4 py-3">
                <div>{enrollment.studyPlanName}</div>
                <div className="text-muted-foreground">{enrollment.academicLevelName ?? "Sin nivel"}</div>
              </td>
              <td className="px-4 py-3">{enrollment.instrumentName ?? "—"}</td>
              <td className="px-4 py-3">
                {enrollment.schedules.length === 0
                  ? "—"
                  : enrollment.schedules
                      .map((schedule) => `${schedule.dayOfWeek} ${schedule.startTime.slice(0, 5)}–${schedule.endTime.slice(0, 5)}`)
                      .join(", ")}
              </td>
              <td className="px-4 py-3">{STATUS_LABELS[enrollment.status]}</td>
              <td className="px-4 py-3">{ACADEMIC_ENROLLMENT_STATUS_LABELS[enrollment.academicStatus]}</td>
              <td className="px-4 py-3">
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
              </td>
            </tr>
          ))}
        </tbody>
      </table>
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
