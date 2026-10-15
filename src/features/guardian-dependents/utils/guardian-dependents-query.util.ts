import type { QueryParamValue } from "@common/types/query-param.types";
import { parsePaginationQuery } from "@common/utils/pagination-query.util";
import { getQueryParamValue, parseOptionalBooleanQueryParam } from "@common/utils/query-param.util";
import { parseSortQuery } from "@common/utils/sort-query.util";

import type { GuardianDependentsQuery } from "@features/guardian-dependents/types/guardian-dependents-query.types";
import { GUARDIAN_LINK_STATUS } from "@features/guardian-dependents/types/guardian-link-status.types";
import { GUARDIAN_RELATIONSHIP } from "@features/guardian-dependents/types/guardian-relationship.types";

const SORT_FIELDS = new Set<GuardianDependentsQuery["sort"]["field"]>([
  "firstName",
  "lastName",
  "documentNumber",
  "status",
  "relationship",
  "createdAt",
]);

export function parseGuardianDependentsQuery(params: Record<string, QueryParamValue>): GuardianDependentsQuery {
  const pagination = parsePaginationQuery(params);

  const status = Object.values(GUARDIAN_LINK_STATUS).find(
    (value) => value !== GUARDIAN_LINK_STATUS.ENDED && value === getQueryParamValue(params.status),
  );

  const relationship = Object.values(GUARDIAN_RELATIONSHIP).find((value) => value === getQueryParamValue(params.relationship));

  return {
    ...pagination,
    search: pagination.search.slice(0, 100),
    sort: parseSortQuery(params, SORT_FIELDS, { field: "createdAt", direction: "desc" }),
    status,
    relationship,
    primaryContact: parseOptionalBooleanQueryParam(params.primaryContact),
  };
}
