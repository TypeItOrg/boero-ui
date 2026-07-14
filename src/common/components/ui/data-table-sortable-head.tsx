"use client";

import type * as React from "react";
import { ChevronsDownIcon, ChevronsUpDownIcon, ChevronsUpIcon } from "lucide-react";

import { Button } from "@common/components/ui/button";
import { TableHead } from "@common/components/ui/table";
import { cn } from "@common/utils/cn.util";
import { getNextSort, getSortDirection, type Sort, type SortDirection } from "@common/utils/sort-query.util";

type DataTableSortableHeadProps<TField extends string> = React.ComponentProps<typeof TableHead> & {
  defaultDirection?: SortDirection;
  field: TField;
  label: string;
  sort: Sort<TField>;
  onSortChange: (sort: Sort<TField>) => void;
};

export function DataTableSortableHead<TField extends string>({
  className,
  defaultDirection = "asc",
  field,
  label,
  onSortChange,
  sort,
  ...props
}: DataTableSortableHeadProps<TField>): React.ReactElement {
  const direction = getSortDirection(sort, field);

  function updateSort(): void {
    onSortChange(getNextSort(sort, field, defaultDirection));
  }

  return (
    <TableHead aria-sort={getSortAriaValue(direction)} className={cn("group/sort-head", className)} {...props}>
      <Button
        type="button"
        variant="ghost"
        className="-ml-2 px-2 font-medium"
        onClick={updateSort}
        aria-label={`Ordenar por ${label}`}
      >
        {label}
        <SortIcon direction={direction} />
      </Button>
    </TableHead>
  );
}

function SortIcon({ direction }: { direction: SortDirection | undefined }): React.ReactElement {
  if (direction === "asc") {
    return <ChevronsUpIcon data-icon="inline-end" />;
  }

  if (direction === "desc") {
    return <ChevronsDownIcon data-icon="inline-end" />;
  }

  return <ChevronsUpDownIcon data-icon="inline-end" className="text-muted-foreground" />;
}

function getSortAriaValue(direction: SortDirection | undefined): React.AriaAttributes["aria-sort"] {
  if (direction === "asc") return "ascending";
  if (direction === "desc") return "descending";

  return "none";
}
