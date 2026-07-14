export type PlatformDashboardSummary = {
  institutions: number;
  activeInstitutions: number;
  inactiveInstitutions: number;
  people: number;
  usersWithAccess: number;
};

export type MonthlyInstitutionRegistration = {
  year: number;
  month: number;
  count: number;
};

export type RecentInstitution = {
  id: string;
  name: string;
  city: string;
  province: string;
  active: boolean;
  createdAt: string;
};

export type PlatformDashboard = {
  summary: PlatformDashboardSummary;
  institutionRegistrations: MonthlyInstitutionRegistration[];
  recentInstitutions: RecentInstitution[];
};
