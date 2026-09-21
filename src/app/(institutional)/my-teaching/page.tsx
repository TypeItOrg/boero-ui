import Link from "next/link";
import { GraduationCapIcon } from "lucide-react";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@common/components/ui/empty";
import { Button } from "@common/components/ui/button";
import { DataTableNavigationProvider } from "@common/components/ui/data-table-navigation";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@common/components/ui/table";
import { requireInstitutionalUser } from "@features/institutional-auth/services/get-institutional-user.service";
import { InstitutionalAccessDenied } from "@features/institutional-auth/components/institutional-access-denied";
import { InstitutionalBreadcrumb } from "@features/institutional-auth/components/institutional-breadcrumb";
import { PlatformPageShell } from "@features/platform-auth/components/platform-page-shell";
import { fetchTeacherClasses } from "@features/course-enrollments/services/teacher-course.service";
import { CourseEnrollmentPagination } from "@features/course-enrollments/components/course-enrollment-pagination";
import {
  parseCourseEnrollmentPaginationParams,
  type CourseEnrollmentSearchParams,
} from "@features/course-enrollments/utils/course-enrollment-pagination.util";
import { courseWeekDayLabels } from "@features/academic/utils/academic-labels.util";

export const metadata = { title: "Mis clases y cursos" };

export default async function MyTeachingPage({ searchParams }: { searchParams: Promise<CourseEnrollmentSearchParams> }): Promise<React.ReactElement> {
  const user = await requireInstitutionalUser();
  if (!user.roles.includes("Profesor")) {
    return <InstitutionalAccessDenied description="Esta vista corresponde a profesores con clases asignadas." />;
  }
  const { page, size } = parseCourseEnrollmentPaginationParams(await searchParams);
  const data = await fetchTeacherClasses(user.institutionId, page, size);
  return (
    <PlatformPageShell title="Mis clases y cursos" breadcrumb={<InstitutionalBreadcrumb />}>
      <DataTableNavigationProvider>
        {data.items.length === 0 ? (
          <Empty className="min-h-56 flex-1 rounded-lg border border-solid">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <GraduationCapIcon aria-hidden="true" />
              </EmptyMedia>
              <EmptyTitle>Todavía no tenés clases asignadas</EmptyTitle>
              <EmptyDescription>Cuando la institución te asigne una clase, podrás consultar sus horarios y estudiantes acá.</EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <div className="min-h-0 flex-1 overflow-hidden rounded-lg border">
            <Table containerClassName="table-scrollbar">
              <TableHeader className="bg-muted">
                <TableRow className="h-11">
                  <TableHead className="w-16 pl-4">
                    <span className="sr-only">Acciones</span>
                  </TableHead>
                  <TableHead>Curso</TableHead>
                  <TableHead>Clase</TableHead>
                  <TableHead>Horarios</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.items.map((item) => (
                  <TableRow key={item.courseClass.id} className="h-12">
                    <TableCell className="pl-4">
                      <Button asChild variant="outline" size="sm">
                        <Link href={`/my-teaching/classes/${item.courseClass.id}`}>Ver cursadas</Link>
                      </Button>
                    </TableCell>
                    <TableCell>
                      {item.academicSpaceName}
                      {item.instrumentName ? ` · ${item.instrumentName}` : ""}
                    </TableCell>
                    <TableCell>{item.classLabel}</TableCell>
                    <TableCell>
                      {item.courseClass.days
                        .map(
                          (day) =>
                            `${courseWeekDayLabels[day.dayOfWeek]} ${day.schedules.map((schedule) => `${schedule.startTime.slice(0, 5)}–${schedule.endTime.slice(0, 5)}`).join(", ")}`,
                        )
                        .join("; ")}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
        <CourseEnrollmentPagination page={page} size={size} totalItems={data.totalItems} totalPages={data.totalPages} itemLabel="clases" />
      </DataTableNavigationProvider>
    </PlatformPageShell>
  );
}
