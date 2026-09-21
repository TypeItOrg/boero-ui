"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { Button } from "@common/components/ui/button";
import { CourseEnrollmentMutationDialog } from "@features/course-enrollments/components/course-enrollment-mutation-dialog";
import type { CourseEnrollment } from "@features/course-enrollments/types/course-enrollment.types";
import { COURSE_ENROLLMENT_STATUS } from "@features/course-enrollments/types/course-enrollment-status.types";

type CourseEnrollmentDetailActionsProps = {
  enrollment: CourseEnrollment;
  canWithdraw: boolean;
  canUpdateAcademicStatus: boolean;
  canReadWaitlist: boolean;
  returnTo: string;
};

export function CourseEnrollmentDetailActions({
  enrollment,
  canWithdraw,
  canUpdateAcademicStatus,
  canReadWaitlist,
  returnTo,
}: CourseEnrollmentDetailActionsProps): React.ReactElement {
  const router = useRouter();
  const [mode, setMode] = React.useState<"withdraw" | "academic">();
  const canUpdateResult =
    canUpdateAcademicStatus &&
    enrollment.status !== COURSE_ENROLLMENT_STATUS.WITHDRAWN &&
    enrollment.status !== COURSE_ENROLLMENT_STATUS.ADMINISTRATIVELY_WITHDRAWN;

  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <Button asChild size="lg" variant="outline">
        <Link href={returnTo}>Volver</Link>
      </Button>
      <div className="flex flex-wrap items-center gap-2">
        {canReadWaitlist ? (
          <Button asChild size="lg" variant="outline">
            <Link href={`/course-enrollments/${enrollment.courseId}/waitlist`}>Ver lista de espera</Link>
          </Button>
        ) : null}
        {canUpdateResult ? (
          <Button size="lg" onClick={() => setMode("academic")}>
            Registrar resultado
          </Button>
        ) : null}
        {canWithdraw && enrollment.status === COURSE_ENROLLMENT_STATUS.ENROLLED ? (
          <Button size="lg" variant="destructive" onClick={() => setMode("withdraw")}>
            Registrar baja
          </Button>
        ) : null}
      </div>
      {mode ? (
        <CourseEnrollmentMutationDialog
          enrollment={enrollment}
          mode={mode}
          open
          onOpenChange={(open) => {
            if (!open) {
              setMode(undefined);
            }
          }}
          onUpdated={() => router.refresh()}
        />
      ) : null}
    </div>
  );
}
