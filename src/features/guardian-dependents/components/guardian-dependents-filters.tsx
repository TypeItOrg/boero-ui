"use client";

import type { ReactElement } from "react";

import { DataTableFilters } from "@common/components/ui/data-table-filters";

import { GUARDIAN_LINK_STATUS_LABELS, GUARDIAN_RELATIONSHIP_LABELS } from "@features/guardian-dependents/constants/guardian-dependent.constants";
import type { GuardianDependentsQuery } from "@features/guardian-dependents/types/guardian-dependents-query.types";
import { GUARDIAN_LINK_STATUS } from "@features/guardian-dependents/types/guardian-link-status.types";
import { GUARDIAN_RELATIONSHIP } from "@features/guardian-dependents/types/guardian-relationship.types";

export function GuardianDependentsFilters({ query }: { query: GuardianDependentsQuery }): ReactElement {
  return (
    <DataTableFilters
      search={query.search}
      searchPlaceholder="Buscar por nombre, apellido o documento..."
      size={query.size}
      triggerPosition="external"
      selectFilters={[
        {
          defaultValue: "all",
          label: "Estado",
          name: "status",
          value: query.status ?? "all",
          options: [
            { value: "all", label: "Todos los estados" },
            ...[GUARDIAN_LINK_STATUS.PENDING, GUARDIAN_LINK_STATUS.ACTIVE, GUARDIAN_LINK_STATUS.REJECTED].map((value) => ({
              value,
              label: GUARDIAN_LINK_STATUS_LABELS[value],
            })),
          ],
        },
        {
          defaultValue: "all",
          label: "Vínculo",
          name: "relationship",
          value: query.relationship ?? "all",
          options: [
            { value: "all", label: "Todos los vínculos" },
            ...Object.values(GUARDIAN_RELATIONSHIP).map((value) => ({ value, label: GUARDIAN_RELATIONSHIP_LABELS[value] })),
          ],
        },
      ]}
      advancedSelectFilters={[
        {
          defaultValue: "all",
          label: "Contacto principal",
          name: "primaryContact",
          value: query.primaryContact === undefined ? "all" : String(query.primaryContact),
          options: [
            { value: "all", label: "Todos" },
            { value: "true", label: "Soy contacto principal" },
            { value: "false", label: "No soy contacto principal" },
          ],
        },
      ]}
      advancedResetKeys={["primaryContact"]}
    />
  );
}
