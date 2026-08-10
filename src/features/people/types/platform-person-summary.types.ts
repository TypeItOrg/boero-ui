import type { PersonSummaryRole } from "@features/people/types/person-summary-role.types";
import type { PersonSummary } from "@features/people/types/person-summary.types";

export type PlatformPersonSummary = PersonSummary & {
  institutionId: string;
  institutionName: string;
  roles: PersonSummaryRole[];
};
