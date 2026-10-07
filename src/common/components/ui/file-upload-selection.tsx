"use client";

import { XIcon } from "lucide-react";

import { Button } from "@common/components/ui/button";
import { cn } from "@common/utils/cn.util";

export function FileUploadSelection({
  label,
  name,
  file,
  preview,
  previewAction,
  secondaryActions,
  primaryAction,
  statusLabel = file ? "Sin guardar" : "Guardado",
  removeLabel,
  disabled = false,
  onRemove,
}: {
  label: string;
  name: string;
  file?: File;
  preview?: React.ReactNode;
  previewAction?: React.ReactNode;
  secondaryActions?: React.ReactNode;
  primaryAction?: React.ReactNode;
  statusLabel?: string;
  removeLabel?: string;
  disabled?: boolean;
  onRemove?: () => void;
}): React.ReactElement {
  const hasAdministrativeActions = secondaryActions !== undefined || primaryAction !== undefined;

  return (
    <ul aria-label={label} className="@container/file-selection min-w-0">
      <li
        className={cn(
          "bg-muted/50 min-w-0 items-center gap-3 rounded-lg p-3",
          hasAdministrativeActions ? "grid grid-cols-[3rem_minmax(0,1fr)] @xl/file-selection:flex" : "flex",
        )}
      >
        {preview ? (
          <div className="bg-background flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-md p-1.5">{preview}</div>
        ) : null}
        <div className="min-w-0 flex-1">
          <p className={cn("text-foreground text-sm font-medium", hasAdministrativeActions ? "line-clamp-2 break-all" : "truncate")} title={name}>
            {name}
          </p>
          <p className="text-muted-foreground mt-0.5 text-xs">
            {file ? (
              <>
                <span className="font-normal whitespace-nowrap tabular-nums">{formatFileSize(file.size)}</span>
                {" · "}
                <span>{statusLabel}</span>
              </>
            ) : (
              statusLabel
            )}
          </p>
        </div>
        {previewAction || secondaryActions || primaryAction || (onRemove && removeLabel) ? (
          <div
            className={cn(
              "flex shrink-0 items-center gap-3",
              hasAdministrativeActions &&
                "col-span-2 grid w-full gap-2 border-t pt-3 @xl/file-selection:flex @xl/file-selection:w-auto @xl/file-selection:flex-nowrap @xl/file-selection:gap-3 @xl/file-selection:border-0 @xl/file-selection:pt-0",
            )}
          >
            <div className={cn("flex shrink-0 items-center gap-1", hasAdministrativeActions && "justify-between @xl/file-selection:justify-start")}>
              {previewAction}
              {secondaryActions ? <div className="flex items-center gap-1">{secondaryActions}</div> : null}
              {onRemove && removeLabel ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-lg"
                  className="hover:text-destructive size-11"
                  disabled={disabled}
                  aria-label={removeLabel}
                  onClick={onRemove}
                >
                  <XIcon aria-hidden="true" />
                </Button>
              ) : null}
            </div>
            {primaryAction}
          </div>
        ) : null}
      </li>
    </ul>
  );
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes} B`;
  }

  const inMebibytes = bytes >= 1024 * 1024;
  const amount = bytes / (inMebibytes ? 1024 * 1024 : 1024);

  return `${new Intl.NumberFormat("es-AR", { maximumFractionDigits: 1 }).format(amount)} ${inMebibytes ? "MB" : "KB"}`;
}
