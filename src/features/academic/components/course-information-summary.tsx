import type { ReactElement } from "react";

import { BookOpenCheckIcon } from "lucide-react";

import { OptionalValue } from "@common/components/optional-value";
import { SectionHeader } from "@common/components/section-header";
import { Badge } from "@common/components/ui/badge";
import { DETAIL_LABEL_CLASS_NAME } from "@common/constants/detail-label.constants";

import type { Course } from "@features/academic/types/course.types";
import { academicSpaceFormatLabels, academicSpaceTypeLabels, courseStatusLabels } from "@features/academic/utils/academic-labels.util";
import { formatStudyPlanName } from "@features/academic/utils/study-plan-label.util";

const STATUS_VARIANTS = { ACTIVE: "success", CLOSED: "outline", INACTIVE: "secondary" } as const;

export function CourseInformationSummary({ course }: { course: Course }): ReactElement {
  const status = course.status ?? (course.active ? "ACTIVE" : "INACTIVE");

  const statusVariant = STATUS_VARIANTS[status] ?? "secondary";

  return (
    <section aria-labelledby="course-summary-title" className="bg-muted/25 rounded-xl border p-5 md:p-6">
      <header className="-mx-5 border-b px-5 pb-5 md:-mx-6 md:px-6">
        <SectionHeader
          icon={BookOpenCheckIcon}
          title="Información del curso"
          description="Consultá el espacio instanciado, su plan y el ciclo lectivo."
          titleId="course-summary-title"
        />
      </header>

      <dl className="grid gap-5 pt-5 sm:grid-cols-3">
        <div>
          <dt className={DETAIL_LABEL_CLASS_NAME}>Trayecto formativo</dt>
          <dd className="mt-1 font-semibold">{course.trainingPathName}</dd>
        </div>
        <div>
          <dt className={DETAIL_LABEL_CLASS_NAME}>Plan de estudio</dt>
          <dd className="mt-1 font-semibold">{formatStudyPlanName(course)}</dd>
        </div>
        <div>
          <dt className={DETAIL_LABEL_CLASS_NAME}>Ciclo lectivo</dt>
          <dd className="mt-1 font-semibold tabular-nums">{course.year}</dd>
        </div>
        <div>
          <dt className={DETAIL_LABEL_CLASS_NAME}>Espacio académico</dt>
          <dd className="mt-1 font-semibold">{course.academicSpaceName}</dd>
        </div>
        <div>
          <dt className={DETAIL_LABEL_CLASS_NAME}>Nivel</dt>
          <dd className="mt-1 font-semibold">{course.academicLevelName ?? "Sin nivel"}</dd>
        </div>
        <div>
          <dt className={DETAIL_LABEL_CLASS_NAME}>Tipo</dt>
          <dd className="mt-1 font-semibold">{academicSpaceTypeLabels[course.academicSpaceType]}</dd>
        </div>
        <div>
          <dt className={DETAIL_LABEL_CLASS_NAME}>Formato</dt>
          <dd className="mt-1 font-semibold">{academicSpaceFormatLabels[course.academicSpaceFormat]}</dd>
        </div>
        <div>
          <dt className={DETAIL_LABEL_CLASS_NAME}>Instrumento</dt>
          <dd className="mt-1 font-semibold">
            <OptionalValue value={course.instrumentName} fallback="Sin instrumento" />
          </dd>
        </div>
        <div>
          <dt className={DETAIL_LABEL_CLASS_NAME}>Estado</dt>
          <dd className="mt-1">
            <Badge variant={statusVariant}>
              {courseStatusLabels[course.status as keyof typeof courseStatusLabels] ?? (course.active ? "Activo" : "Inactivo")}
            </Badge>
          </dd>
        </div>
      </dl>
    </section>
  );
}
