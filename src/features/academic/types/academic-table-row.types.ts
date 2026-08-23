export type AcademicTableRow = {
  id: string;
  institutionId?: string;
  institutionName?: string;
  primaryValue: string;
  detailValues: readonly string[];
  status: string;
  active: boolean;
  effectiveFrom?: string | null;
  statusValue?: string;
  deletedAt?: string | null;
};
