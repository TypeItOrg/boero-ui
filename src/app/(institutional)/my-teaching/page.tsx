import Link from "next/link";
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
          <p className="text-muted-foreground">Todavía no tenés clases asignadas.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Curso</TableHead>
                <TableHead>Clase</TableHead>
                <TableHead>Horarios</TableHead>
                <TableHead>Estudiantes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.items.map((item) => (
                <TableRow key={item.courseClass.id}>
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
                  <TableCell>
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/my-teaching/classes/${item.courseClass.id}`}>Ver cursadas</Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
        <CourseEnrollmentPagination page={page} size={size} totalItems={data.totalItems} totalPages={data.totalPages} itemLabel="clases" />
      </DataTableNavigationProvider>
    </PlatformPageShell>
  );
}
