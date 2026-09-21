export type AcademicTableRow = {
  scopedActions?: { update: boolean; delete: boolean; restore: boolean; status: boolean; createVersion: boolean; waitlist: boolean };
  id: string;
  institutionId?: string;
  institutionName?: string;
  primaryValue: string;
  detailValues: readonly string[];
  status: string;
  active: boolean;
  effectiveFrom?: string | null;
  versionNumber?: number;
  statusValue?: string;
  deletedAt?: string | null;
};
