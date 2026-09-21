import type { Metadata } from "next";
import { CalendarRangeIcon } from "lucide-react";

import { DataTableNavigationProvider } from "@common/components/ui/data-table-navigation";
import { getScheduleWeek } from "@features/course-enrollments/utils/schedule-week.util";
import { MyWeeklySchedule } from "@features/course-enrollments/components/my-weekly-schedule";
import { fetchMyWeeklySchedules } from "@features/course-enrollments/services/my-schedules.service";
import { requireInstitutionalUser } from "@features/institutional-auth/services/get-institutional-user.service";
import { InstitutionalBreadcrumb } from "@features/institutional-auth/components/institutional-breadcrumb";
import { PlatformPageShell } from "@features/platform-auth/components/platform-page-shell";
import { PlatformPageIcon } from "@features/platform-auth/components/platform-page-icon";
import type { WeeklyScheduleItem } from "@features/course-enrollments/types/weekly-schedule-item.types";

export const metadata: Metadata = { title: "Mis horarios" };

export default async function MySchedulesPage({
  searchParams,
}: {
  searchParams: Promise<{ week?: string | string[] }>;
}): Promise<React.ReactElement> {
  const user = await requireInstitutionalUser();
  const referenceDate = new Date().toISOString();
  const params = await searchParams;
  const week = getScheduleWeek(params.week, referenceDate);
  const data = await fetchMyWeeklySchedules(user.institutionId, week);
  const items: WeeklyScheduleItem[] = data.enrollments.map((enrollment) => ({
    id: enrollment.id,
    title: enrollment.academicSpaceName,
    instrumentName: enrollment.instrumentName,
    context: [enrollment.trainingPathName, enrollment.studyPlanName, enrollment.academicLevelName].filter(Boolean).join(" · "),
    schedules: enrollment.schedules,
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
