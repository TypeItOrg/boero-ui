"use client";

import type { Dispatch, ReactElement, SetStateAction } from "react";

import { UserRoundCheckIcon } from "lucide-react";

import { SectionHeader } from "@common/components/section-header";
import { AsyncDropdown } from "@common/components/ui/async-dropdown";
import { Field, FieldLabel } from "@common/components/ui/field";

import type { Course } from "@features/academic/types/course.types";
import { formatStudyPlanLabel } from "@features/academic/utils/study-plan-label.util";
import { fetchCatalog } from "@features/course-enrollments/services/course-enrollment-catalog-client.service";
import type { StudentSummary } from "@features/course-enrollments/types/student-summary.types";

export function CourseManualEnrollmentStudentFields({
  studentId,
  setStudentId,
  isPending,
  courseId,
  handleCourseChange,
}: {
  studentId: string | undefined;
  setStudentId: Dispatch<SetStateAction<string | undefined>>;
  isPending: boolean;
  courseId: string;
  handleCourseChange: (nextCourseId: string) => void;
}): ReactElement {
  return (
    <section aria-labelledby="manual-enrollment-student-title" className="bg-muted/25 min-w-0 rounded-xl border p-5 md:p-6">
      <header className="-mx-5 border-b px-5 pb-5 md:-mx-6 md:px-6">
        <SectionHeader
          icon={UserRoundCheckIcon}
          title="Estudiante y curso"
          description="Seleccioná quién realizará la cursada y el curso al que se incorporará."
          titleId="manual-enrollment-student-title"
        />
      </header>

      <div className="mt-5 grid min-w-0 gap-5 sm:grid-cols-2">
        <Field className="min-w-0">
          <FieldLabel htmlFor="studentId" required>
            Estudiante
          </FieldLabel>
          <AsyncDropdown<StudentSummary>
            id="studentId"
            name="studentId"
            value={studentId}
            onValueChange={(id) => {
              setStudentId(id);
            }}
            disabled={isPending}
            queryKey={["manual-enrollment-students"]}
            fetchPage={(input) => fetchCatalog<StudentSummary>("students", input)}
            getItemValue={(student) => student.studentId}
            getItemLabel={(student) => `${student.lastName}, ${student.firstName} · ${student.documentNumber}`}
            placeholder="Seleccionar estudiante"
          />
        </Field>

        <Field className="min-w-0">
          <FieldLabel htmlFor="courseId" required>
            Curso
          </FieldLabel>
          <AsyncDropdown<Course>
            id="courseId"
            name="courseId"
            value={courseId}
            onValueChange={(value) => handleCourseChange(value ?? "")}
            disabled={isPending}
            queryKey={["manual-enrollment-courses"]}
            fetchPage={(input) => fetchCatalog<Course>("course-enrollment-options", input)}
            getItemValue={(course) => course.id}
            getItemLabel={(course) =>
              [
                course.academicSpaceName,
                course.instrumentName,
                course.trainingPathName,
                course.studyPlanName,
                course.academicLevelName ?? "Sin nivel",
                course.year,
              ]
                .filter(Boolean)
                .join(" · ")
            }
            estimateSize={96}
            renderItem={(course) => (
              <div className="grid min-w-0 gap-1 text-left">
                <span className="line-clamp-2 font-medium">{course.academicSpaceName}</span>
                <span className="text-primary text-xs">
                  {[course.academicLevelName ?? "Sin nivel", course.instrumentName, course.year].filter(Boolean).join(" · ")}
                </span>
                <span className="text-muted-foreground truncate text-xs" title={formatStudyPlanLabel(course)}>
                  {formatStudyPlanLabel(course)}
                </span>
              </div>
            )}
            placeholder="Seleccionar curso"
          />
        </Field>
      </div>
    </section>
  );
}
