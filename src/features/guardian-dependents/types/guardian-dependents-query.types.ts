import type { PaginationQuery } from "@common/types/pagination-query.types";
import type { Sort } from "@common/utils/sort-query.util";

import type { GuardianLinkStatus } from "@features/guardian-dependents/types/guardian-link-status.types";
import type { GuardianRelationship } from "@features/guardian-dependents/types/guardian-relationship.types";

export type GuardianDependentsQuery = PaginationQuery & {
  sort: Sort<"firstName" | "lastName" | "documentNumber" | "status" | "relationship" | "createdAt">;
  status?: GuardianLinkStatus;
  relationship?: GuardianRelationship;
  primaryContact?: boolean;
};
