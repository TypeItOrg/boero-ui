import Link from "next/link";
import { CalendarDaysIcon, Clock3Icon, GraduationCapIcon } from "lucide-react";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@common/components/ui/empty";
import { Button } from "@common/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@common/components/ui/card";
import { DataTableNavigationProvider } from "@common/components/ui/data-table-navigation";
import { requireInstitutionalUser } from "@features/institutional-auth/services/get-institutional-user.service";
import { InstitutionalAccessDenied } from "@features/institutional-auth/components/institutional-access-denied";
import { InstitutionalBreadcrumb } from "@features/institutional-auth/components/institutional-breadcrumb";
import { PlatformPageIcon } from "@features/platform-auth/components/platform-page-icon";
import { PlatformPageShell } from "@features/platform-auth/components/platform-page-shell";
import { fetchTeacherClasses } from "@features/course-enrollments/services/teacher-course.service";
import { CourseEnrollmentPagination } from "@features/course-enrollments/components/course-enrollment-pagination";
import {
  COURSE_ENROLLMENT_PAGE_SIZE_OPTIONS,
  parseCourseEnrollmentPaginationParams,
  type CourseEnrollmentSearchParams,
} from "@features/course-enrollments/utils/course-enrollment-pagination.util";
import { courseWeekDayLabels } from "@features/academic/utils/academic-labels.util";

export const metadata = { title: "Mis clases" };

export default async function MyTeachingPage({ searchParams }: { searchParams: Promise<CourseEnrollmentSearchParams> }): Promise<React.ReactElement> {
  const user = await requireInstitutionalUser();
  if (!user.roles.includes("Profesor")) {
    return <InstitutionalAccessDenied description="Esta vista corresponde a profesores con clases asignadas." />;
  }
  const { page, size } = parseCourseEnrollmentPaginationParams(await searchParams);
  const data = await fetchTeacherClasses(user.institutionId, page, size);

  return (
    <PlatformPageShell title="Mis clases" breadcrumb={<InstitutionalBreadcrumb />} actions={<PlatformPageIcon icon={GraduationCapIcon} />}>
      <DataTableNavigationProvider>
        {data.items.length === 0 ? (
          <Empty className="bg-muted/25 min-h-56 flex-1 rounded-lg border border-solid">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <GraduationCapIcon aria-hidden="true" />
              </EmptyMedia>
              <EmptyTitle>Todavía no tenés clases asignadas</EmptyTitle>
              <EmptyDescription>Cuando la institución te asigne una clase, podrás consultar sus horarios y estudiantes acá.</EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <div className="grid items-start gap-4 @4xl/page-shell:grid-cols-2 @7xl/page-shell:grid-cols-3">
            {data.items.map((item) => (
              <Card key={item.courseClass.id} className="h-full gap-0 py-0 transition-shadow hover:shadow-sm">
                <CardHeader className="bg-muted/35 border-b py-4">
                  <CardTitle className="text-lg font-semibold">{item.academicSpaceName}</CardTitle>
                  {item.instrumentName ? <p className="text-muted-foreground text-sm">Instrumento: {item.instrumentName}</p> : null}
                  <p className="text-foreground text-sm font-medium">{item.classLabel}</p>
                </CardHeader>

                <CardContent className="flex flex-1 flex-col gap-4 py-4">
                  <div className="flex flex-col gap-2.5">
                    <div className="text-muted-foreground flex items-center gap-2 text-xs font-medium tracking-wide uppercase">
                      <CalendarDaysIcon className="size-4" aria-hidden="true" />
                      Días y horarios
                    </div>
                    <div className="flex flex-col gap-2">
                      {item.courseClass.days.map((day) => (
                        <div key={day.dayOfWeek} className="bg-muted/20 flex items-start justify-between gap-4 rounded-lg border px-3 py-2.5">
                          <span className="font-medium">{courseWeekDayLabels[day.dayOfWeek]}</span>
                          <div className="text-muted-foreground flex flex-col items-end gap-1 text-sm">
                            {day.schedules.map((schedule) => (
                              <span key={`${schedule.startTime}-${schedule.endTime}`} className="inline-flex items-center gap-1.5 tabular-nums">
                                <Clock3Icon className="size-3.5" aria-hidden="true" />
                                {schedule.startTime.slice(0, 5)}–{schedule.endTime.slice(0, 5)}
                              </span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>

                <CardFooter className="justify-end bg-transparent p-3">
                  <Button asChild variant="ghost">
                    <Link href={`/my-teaching/classes/${item.courseClass.id}`}>Ver cursadas</Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
        {data.totalPages > 1 || page > 0 || size !== COURSE_ENROLLMENT_PAGE_SIZE_OPTIONS[0] ? (
          <CourseEnrollmentPagination page={page} size={size} totalItems={data.totalItems} totalPages={data.totalPages} itemLabel="clases" />
        ) : null}
      </DataTableNavigationProvider>
    </PlatformPageShell>
  );
}
