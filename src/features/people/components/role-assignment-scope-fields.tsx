"use client";

import { useCallback, useId, useState } from "react";
import { AsyncDropdown } from "@common/components/ui/async-dropdown";
import { XIcon } from "lucide-react";
import { Badge } from "@common/components/ui/badge";
import { FormSelect } from "@features/academic/components/academic-form-controls";
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
  const scopeId = useId();
  const pathsId = useId();
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
      <div className="grid gap-1.5 text-sm">
        <label htmlFor={scopeId} className="font-medium">
          {M.LABEL}
        </label>
        <FormSelect
          name={scopeId}
          options={[
            { value: "INSTITUTION", label: M.INSTITUTION },
            { value: "TRAINING_PATHS", label: M.PATHS, disabled: !supportsTrainingPathScope },
          ]}
          disabled={disabled}
          value={value.accessScope}
          onValueChange={(accessScope) => {
            if (accessScope === "INSTITUTION" || accessScope === "TRAINING_PATHS") {
              onChange({ ...value, accessScope, trainingPathIds: [] });
            }
          }}
        />
      </div>
      {value.accessScope === "TRAINING_PATHS" ? (
        <>
          {inactivePermissions.length > 0 ? (
            <p className="text-muted-foreground text-xs">
              {M.INACTIVE}: {inactivePermissions.join(", ")}
            </p>
          ) : null}
          <div className="grid min-w-0 gap-3">
            <label htmlFor={pathsId} className="text-sm font-medium">
              {M.PATHS}
            </label>
            <div className="bg-muted/20 flex min-h-12 min-w-0 flex-wrap items-center gap-2 rounded-xl border px-3 py-2.5">
              {value.trainingPathIds.length === 0 ? <p className="text-muted-foreground text-sm">{M.EMPTY_SELECTION}</p> : null}
              {value.trainingPathIds.map((id) => {
                const name = selectedNames[id] ?? names[id] ?? id;
                return (
                  <Badge key={id} className="h-auto min-h-7 max-w-full gap-2 px-3" size="lg" variant="secondary">
                    <span className="min-w-0 wrap-anywhere whitespace-normal">{name}</span>
                    <Button
                      aria-label={`${M.REMOVE} ${name}`}
                      className="text-muted-foreground hover:text-foreground -mr-1 shrink-0"
                      type="button"
                      size="icon-xs"
                      variant="ghost"
                      disabled={disabled}
                      onClick={() => onChange({ ...value, trainingPathIds: value.trainingPathIds.filter((path) => path !== id) })}
                    >
                      <XIcon />
                    </Button>
                  </Badge>
                );
              })}
            </div>
            <AsyncDropdown<TrainingPathScopeOption>
              id={pathsId}
              fetchPage={fetchPaths}
              queryKey={["role-scope-paths", institutionId, scope]}
              getItemValue={(path) => path.id}
              getItemLabel={(path) => path.name}
              placeholder={M.SEARCH}
              searchPlaceholder={M.SEARCH_PLACEHOLDER}
              emptyMessage={M.NO_RESULTS}
              errorMessage={M.LOAD_ERROR}
              disabled={disabled}
              closeOnSelect={false}
              selectedValues={value.trainingPathIds}
              onValueChange={(_id, path) => {
                if (!path) {
                  return;
                }

                setSelectedNames((current) => ({ ...current, [path.id]: path.name }));
                const isSelected = value.trainingPathIds.includes(path.id);
                onChange({
                  ...value,
                  trainingPathIds: isSelected ? value.trainingPathIds.filter((id) => id !== path.id) : [...value.trainingPathIds, path.id],
                });
              }}
            />
          </div>
        </>
      ) : null}
    </fieldset>
  );
}
