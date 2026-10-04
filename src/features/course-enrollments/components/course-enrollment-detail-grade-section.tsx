"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

import { Button } from "@common/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@common/components/ui/card";
import { CourseEnrollmentGradeDialog } from "@features/course-enrollments/components/course-enrollment-grade-dialog";
import { PublishGradesButton } from "@features/course-enrollments/components/publish-grades-button";
import { COURSE_ENROLLMENT_GRADE_MESSAGES } from "@features/course-enrollments/constants/course-enrollment-grade.constants";
import type { CourseEnrollment } from "@features/course-enrollments/types/course-enrollment.types";

type DetailGradeSectionProps = {
  enrollment: CourseEnrollment;
  canRead: boolean;
  canCreate: boolean;
  canUpdate: boolean;
  canDelete: boolean;
  canPublish: boolean;
};

export function CourseEnrollmentDetailGradeSection({
  enrollment,
  canRead,
  canCreate,
  canUpdate,
  canDelete,
  canPublish,
}: DetailGradeSectionProps): React.ReactElement {
  const router = useRouter();
  const [isOpen, setIsOpen] = React.useState(false);

  if (!canRead) {
    return <></>;
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-2">
        <CardTitle className="text-base">Notas</CardTitle>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={() => setIsOpen(true)}>
            {COURSE_ENROLLMENT_GRADE_MESSAGES.VIEW_GRADES}
          </Button>
          {canPublish ? (
            <PublishGradesButton classId={enrollment.courseClassId} mode="institutional" label="Publicar notas de la clase" />
          ) : null}
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground text-sm">
          Las notas se guardan como borrador. La publicación afecta a todos los estudiantes de {enrollment.courseClassLabel}.
        </p>
      </CardContent>
      <CourseEnrollmentGradeDialog
        enrollment={enrollment}
        mode="institutional"
        canCreate={canCreate}
        canUpdate={canUpdate}
        canDelete={canDelete}
        open={isOpen}
        onOpenChange={setIsOpen}
        onChanged={() => router.refresh()}
      />
    </Card>
  );
}
