"use client";

import type * as React from "react";
import { ChevronLeftIcon, ChevronRightIcon, ChevronsLeft, ChevronsRight } from "lucide-react";

import { Button } from "@common/components/ui/button";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@common/components/ui/select";
import type { PaginationParams } from "@common/types/pagination-params.types";

type DataTablePaginationProps = PaginationParams & {
  isPending?: boolean;
  pageSizeCompactLabel?: string;
  pageSizeLabel?: string;
  pageSizeOptions: readonly number[];
  summaryLabel: React.ReactNode;
  totalPages: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: string) => void;
};

type PageSizeSelectProps = {
  compactLabel: string;
  disabled: boolean;
  label: string;
  options: readonly number[];
  size: number;
  onSizeChange: (size: string) => void;
};

type PageNavigationProps = {
  canGoToNextPage: boolean;
  canGoToPreviousPage: boolean;
  isPending: boolean;
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
};

export function DataTablePagination({
  page,
  size,
  summaryLabel,
  totalPages,
  pageSizeOptions,
  isPending = false,
  pageSizeCompactLabel = "Filas",
  pageSizeLabel = "Filas por página",
  onPageChange,
  onPageSizeChange,
}: DataTablePaginationProps): React.ReactElement {
  const currentPage = totalPages > 0 ? page + 1 : 0;
  const canGoToPreviousPage = page > 0;
  const canGoToNextPage = page < totalPages - 1;

  return (
    <nav aria-label="Paginación de tabla" className="@container/table-pagination px-1">
      <div className="grid gap-4 @4xl/table-pagination:grid-cols-[minmax(0,1fr)_auto] @4xl/table-pagination:items-center">
        <p className="text-muted-foreground min-w-0 truncate text-sm">{summaryLabel}</p>

        <div className="grid gap-4 @2xl/table-pagination:grid-cols-[minmax(0,1fr)_auto] @2xl/table-pagination:items-center @4xl/table-pagination:flex @4xl/table-pagination:gap-6">
          <PageSizeSelect
            compactLabel={pageSizeCompactLabel}
            disabled={isPending}
            label={pageSizeLabel}
            options={pageSizeOptions}
            size={size}
            onSizeChange={onPageSizeChange}
          />

          <div className="flex items-center justify-between gap-3 @2xl/table-pagination:justify-end">
            <p className="text-foreground text-sm font-semibold whitespace-nowrap">
              Página {currentPage} de {totalPages}
            </p>

            <PageNavigation
              canGoToNextPage={canGoToNextPage}
              canGoToPreviousPage={canGoToPreviousPage}
              isPending={isPending}
              page={page}
              totalPages={totalPages}
              onPageChange={onPageChange}
            />
          </div>
        </div>
      </div>
    </nav>
  );
}

function PageSizeSelect({ compactLabel, disabled, label, options, size, onSizeChange }: PageSizeSelectProps): React.ReactElement {
  return (
    <div className="flex min-w-0 items-center gap-2">
      <p className="text-foreground text-sm font-medium whitespace-nowrap">
        <span className="@2xl/table-pagination:hidden">{compactLabel}</span>
        <span className="hidden @2xl/table-pagination:inline">{label}</span>
      </p>
      <Select value={String(size)} onValueChange={onSizeChange} disabled={disabled}>
        <SelectTrigger size="sm" className="w-20">
          <SelectValue>{size}</SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {options.map((pageSize) => (
              <SelectItem key={pageSize} value={String(pageSize)} className="px-2.5 py-1.5">
                {pageSize}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
}

function PageNavigation({
  canGoToNextPage,
  canGoToPreviousPage,
  isPending,
  page,
  totalPages,
  onPageChange,
}: PageNavigationProps): React.ReactElement {
  return (
    <div className="flex gap-2">
      <Button
        variant="outline"
        size="icon-sm"
        className="hidden @2xl/table-pagination:inline-flex"
        aria-label="Ir a la primera página"
        onClick={() => onPageChange(0)}
        disabled={isPending || !canGoToPreviousPage}
      >
        <ChevronsLeft />
      </Button>
      <Button
        variant="outline"
        size="icon-sm"
        aria-label="Ir a la página anterior"
        onClick={() => onPageChange(page - 1)}
        disabled={isPending || !canGoToPreviousPage}
      >
        <ChevronLeftIcon />
      </Button>
      <Button
        variant="outline"
        size="icon-sm"
        aria-label="Ir a la página siguiente"
        onClick={() => onPageChange(page + 1)}
        disabled={isPending || !canGoToNextPage}
      >
        <ChevronRightIcon />
      </Button>
      <Button
        variant="outline"
        size="icon-sm"
        className="hidden @2xl/table-pagination:inline-flex"
        aria-label="Ir a la última página"
        onClick={() => onPageChange(totalPages - 1)}
        disabled={isPending || !canGoToNextPage}
      >
        <ChevronsRight />
      </Button>
    </div>
  );
}
