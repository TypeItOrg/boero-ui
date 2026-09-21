"use client";

import { useCallback, useState } from "react";
import { AsyncDropdown } from "@common/components/ui/async-dropdown";
import { Button } from "@common/components/ui/button";
import type { AsyncDropdownFetchPageInput } from "@common/types/async-dropdown-fetch-page-input.types";
import { parseHttpResponse } from "@common/utils/http-response-error.util";
import type { RoleAssignment } from "@features/people/types/role-assignment.types";
import type { TrainingPathScopeOption } from "@features/people/types/training-path-scope-option.types";
import type { PeopleScope } from "@features/people/utils/people-scope.util";
import { ROLE_SCOPE_MESSAGES as M } from "@features/people/constants/role-scope.constants";

type Props = {
  institutionId: string;
  scope: PeopleScope;
  value: RoleAssignment;
  names: Record<string, string>;
  onChange: (assignment: RoleAssignment) => void;
  disabled: boolean;
  supportsTrainingPathScope: boolean;
  inactivePermissions: readonly string[];
};

export function RoleAssignmentScopeFields({
  institutionId,
  scope,
  value,
  names,
  onChange,
  disabled,
  supportsTrainingPathScope,
  inactivePermissions,
}: Props) {
  const [selectedNames, setSelectedNames] = useState(names);
  const fetchPaths = useCallback(
    async ({ page, search, size, signal }: AsyncDropdownFetchPageInput) => {
      const params = new URLSearchParams({ institutionId, scope, page: String(page), size: String(size), search });
      const response = await fetch(`/api/role-training-path-options?${params}`, { signal, cache: "no-store" });
      const data = await parseHttpResponse<{ items: TrainingPathScopeOption[]; page: number; totalPages: number }>(response, M.LOAD_ERROR);
      return { items: data.items, nextPage: data.page + 1 < data.totalPages ? data.page + 1 : null };
    },
    [institutionId, scope],
  );
  return (
    <fieldset className="grid gap-3 border-t pt-3" disabled={disabled}>
      <label className="grid gap-1.5 text-sm">
        <span className="font-medium">{M.LABEL}</span>
        <select
          className="bg-background h-10 rounded-md border px-3"
          value={value.accessScope}
          onChange={(event) => onChange({ ...value, accessScope: event.target.value as RoleAssignment["accessScope"], trainingPathIds: [] })}
        >
          <option value="INSTITUTION">{M.INSTITUTION}</option>
          <option value="TRAINING_PATHS" disabled={!supportsTrainingPathScope}>
            {M.PATHS}
          </option>
        </select>
      </label>
      <p className="text-muted-foreground text-xs">{value.accessScope === "INSTITUTION" ? M.GLOBAL : M.LIMITED}</p>
      {value.accessScope === "TRAINING_PATHS" ? (
        <>
          {inactivePermissions.length > 0 ? (
            <p className="text-muted-foreground text-xs">
              {M.INACTIVE}: {inactivePermissions.join(", ")}
            </p>
          ) : null}
          <AsyncDropdown<TrainingPathScopeOption>
            fetchPage={fetchPaths}
            queryKey={["role-scope-paths", institutionId, scope]}
            getItemValue={(path) => path.id}
            getItemLabel={(path) => path.name}
            placeholder={M.SEARCH}
            disabled={disabled}
            onValueChange={(_id, path) => {
              if (path && !value.trainingPathIds.includes(path.id)) {
                setSelectedNames((current) => ({ ...current, [path.id]: path.name }));
                onChange({ ...value, trainingPathIds: [...value.trainingPathIds, path.id] });
              }
            }}
          />
          <ul className="grid gap-1">
            {value.trainingPathIds.map((id) => (
              <li key={id} className="flex items-center justify-between gap-2 text-sm">
                <span>{selectedNames[id] ?? names[id] ?? id}</span>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  disabled={disabled}
                  onClick={() => onChange({ ...value, trainingPathIds: value.trainingPathIds.filter((path) => path !== id) })}
                >
                  {M.REMOVE}
                </Button>
              </li>
            ))}
          </ul>
          {value.trainingPathIds.length === 0 ? <p className="text-destructive text-xs">{M.REQUIRED}</p> : null}
        </>
      ) : null}
    </fieldset>
  );
}
