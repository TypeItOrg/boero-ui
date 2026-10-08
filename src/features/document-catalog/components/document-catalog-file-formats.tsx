"use client";

import type { Dispatch, ReactElement, SetStateAction } from "react";

import { ChevronDownIcon } from "lucide-react";

import { Button } from "@common/components/ui/button";
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuTrigger } from "@common/components/ui/dropdown-menu";

import { FormField } from "@features/academic/components/academic-form-controls";
import type { DocumentCatalogActionState } from "@features/document-catalog/types/document-catalog-action-state.types";
import { DOCUMENT_FILE_CATEGORIES } from "@features/enrollment-applications/constants/documentation.constants";
import { formatDocumentFileCategories } from "@features/enrollment-applications/utils/document-file-category.util";

export function DocumentCatalogFileFormats({
  state,
  allowedFormats,
  disabled,
  setAllowedFormats,
}: {
  state: DocumentCatalogActionState;
  allowedFormats: string[];
  disabled: boolean;
  setAllowedFormats: Dispatch<SetStateAction<string[]>>;
}): ReactElement {
  return (
    <FormField name="catalog-file-types" label="Tipos de archivo admitidos" error={state.fieldErrors?.allowedFormats} required>
      {allowedFormats.map((format) => (
        <input key={format} type="hidden" name="allowedFormats" value={format} />
      ))}
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button
            id="catalog-file-types"
            aria-invalid={Boolean(state.fieldErrors?.allowedFormats)}
            type="button"
            size="lg"
            variant="outline"
            disabled={disabled}
            className="w-full min-w-0 justify-between font-normal"
          >
            <span className={allowedFormats.length === 0 ? "text-muted-foreground truncate" : "truncate"}>
              {allowedFormats.length > 0 ? formatDocumentFileCategories(allowedFormats) : "Seleccionar tipos"}
            </span>
            <ChevronDownIcon className="text-muted-foreground shrink-0" aria-hidden="true" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-(--radix-dropdown-menu-trigger-width)" aria-label="Tipos de archivo admitidos">
          {DOCUMENT_FILE_CATEGORIES.map((category) => (
            <DropdownMenuCheckboxItem
              key={category.value}
              className="min-h-9 px-2.5 pr-8"
              checked={
                category.formats.every((format) => allowedFormats.includes(format))
                  ? true
                  : category.formats.some((format) => allowedFormats.includes(format))
                    ? "indeterminate"
                    : false
              }
              onSelect={(event) => event.preventDefault()}
              onCheckedChange={(checked) => {
                setAllowedFormats((current) => [
                  ...current.filter((format) => !category.formats.some((categoryFormat) => categoryFormat === format)),
                  ...(checked === true ? category.formats : []),
                ]);
              }}
              disabled={disabled}
            >
              {category.label}
            </DropdownMenuCheckboxItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </FormField>
  );
}
