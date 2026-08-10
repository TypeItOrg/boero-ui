import type { PersonSummaryRole } from "@features/people/types/person-summary-role.types";

export type PersonSummary = {
  id: string;
  firstName: string;
  lastName: string;
  documentNumber: string;
  email: string | null;
  phoneNumber: string | null;
  enabled: boolean;
  roles?: PersonSummaryRole[];
};
