import type { Metadata } from "next";
import { CalendarRangeIcon } from "lucide-react";

import { DataTableNavigationProvider } from "@common/components/ui/data-table-navigation";
import { MyWeeklySchedule } from "@features/course-enrollments/components/my-weekly-schedule";
import { fetchTeacherWeeklySchedules } from "@features/course-enrollments/services/teacher-course.service";
import type { WeeklyScheduleItem } from "@features/course-enrollments/types/weekly-schedule-item.types";
import { getScheduleWeek } from "@features/course-enrollments/utils/schedule-week.util";
import { InstitutionalAccessDenied } from "@features/institutional-auth/components/institutional-access-denied";
import { InstitutionalBreadcrumb } from "@features/institutional-auth/components/institutional-breadcrumb";
import { requireInstitutionalUser } from "@features/institutional-auth/services/get-institutional-user.service";
import { PlatformPageIcon } from "@features/platform-auth/components/platform-page-icon";
import { PlatformPageShell } from "@features/platform-auth/components/platform-page-shell";

export const metadata: Metadata = { title: "Mis horarios" };

export default async function TeacherSchedulesPage({
  searchParams,
}: {
  searchParams: Promise<{ week?: string | string[] }>;
}): Promise<React.ReactElement> {
  const user = await requireInstitutionalUser();
  if (!user.roles.includes("Profesor")) {
    return <InstitutionalAccessDenied description="Esta vista corresponde a profesores con clases asignadas." />;
  }

  const referenceDate = new Date().toISOString();
  const params = await searchParams;
  const week = getScheduleWeek(params.week, referenceDate);
  const data = await fetchTeacherWeeklySchedules(user.institutionId, week);
  const items: WeeklyScheduleItem[] = data.classes.map((assignedClass) => ({
    id: assignedClass.courseClass.id,
    title: assignedClass.academicSpaceName,
    instrumentName: assignedClass.instrumentName,
    context: assignedClass.classLabel,
    schedules: assignedClass.courseClass.days.flatMap((day) =>
      day.schedules.map((schedule) => ({
        id: `${day.dayOfWeek}-${schedule.startTime}-${schedule.endTime}`,
        dayOfWeek: day.dayOfWeek,
        startTime: schedule.startTime,
        endTime: schedule.endTime,
      })),
    ),
  }));

  return (
    <PlatformPageShell
      minViewportHeight
      title="Mis horarios"
      breadcrumb={<InstitutionalBreadcrumb />}
      actions={<PlatformPageIcon icon={CalendarRangeIcon} />}
    >
      <DataTableNavigationProvider>
        <MyWeeklySchedule items={items} referenceDate={referenceDate} weekStart={data.weekStart} />
      </DataTableNavigationProvider>
    </PlatformPageShell>
  );
}
