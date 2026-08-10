import type { MonthlyInstitutionRegistration } from "@features/platform-dashboard/types/monthly-institution-registration.types";
import type { PlatformDashboardSummary } from "@features/platform-dashboard/types/platform-dashboard-summary.types";
import type { RecentInstitution } from "@features/platform-dashboard/types/recent-institution.types";

export type PlatformDashboard = {
  summary: PlatformDashboardSummary;
  institutionRegistrations: MonthlyInstitutionRegistration[];
  recentInstitutions: RecentInstitution[];
};
