"use client";

import { useId, useRef, useState, type DragEvent, type ReactElement, type Ref } from "react";

import { UploadIcon } from "lucide-react";

import { Button } from "@common/components/ui/button";
import { cn } from "@common/utils/cn.util";

export function rejectFileDragOutside(event: DragEvent<HTMLElement>): void {
  if (!event.defaultPrevented && event.dataTransfer.types.includes("Files")) {
    event.preventDefault();
    event.dataTransfer.dropEffect = "none";
  }
}

export function FileDropzone({
  accept,
  inputLabel,
  selectLabel,
  title,
  dragTitle,
  description,
  error,
  errorId,
  disabled = false,
  buttonRef,
  onSelectFiles,
}: {
  accept: readonly string[];
  inputLabel: string;
  selectLabel: string;
  title: string;
  dragTitle: string;
  description: string;
  error?: string;
  errorId?: string;
  disabled?: boolean;
  buttonRef?: Ref<HTMLButtonElement>;
  onSelectFiles: (files: File[], silent?: boolean) => void;
}): ReactElement {
  const id = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);

  function handleDragOver(event: DragEvent<HTMLButtonElement>): void {
    if (!event.dataTransfer.types.includes("Files")) {
      return;
    }

    event.preventDefault();

    const items = Array.from(event.dataTransfer.items).filter((item) => item.kind === "file");
    // Some browsers expose the MIME type only after the file has been dropped.
    const canDrop = !disabled && (items.length === 0 || (items.length === 1 && (!items[0].type || accept.includes(items[0].type))));

    event.dataTransfer.dropEffect = canDrop ? "copy" : "none";
    setDragActive(canDrop);
  }

  return (
    <>
      <input
        ref={inputRef}
        id={`${id}-input`}
        type="file"
        accept={accept.join(",")}
        disabled={disabled}
        className="hidden"
        aria-label={inputLabel}
        aria-invalid={Boolean(error)}
        onChange={(event) => {
          onSelectFiles(Array.from(event.currentTarget.files ?? []));
          event.currentTarget.value = "";
        }}
      />
      <Button
        ref={buttonRef}
        type="button"
        variant="outline"
        disabled={disabled}
        aria-label={selectLabel}
        aria-describedby={`${id}-description${error && errorId ? ` ${errorId}` : ""}`}
        className={cn(
          "hover:bg-muted/40 h-auto min-h-44 w-full cursor-pointer flex-col gap-4 px-4 py-6 text-center whitespace-normal motion-reduce:transform-none motion-reduce:transition-none sm:px-6",
          dragActive && "border-primary bg-primary/5 hover:bg-primary/5",
          error && "border-destructive focus-visible:border-destructive focus-visible:ring-destructive/20",
        )}
        onClick={() => inputRef.current?.click()}
        onDragOver={handleDragOver}
        onDragLeave={() => setDragActive(false)}
        onDrop={(event) => {
          event.preventDefault();
          setDragActive(false);
          onSelectFiles(Array.from(event.dataTransfer.files), true);
        }}
      >
        <span
          className={cn(
            "bg-primary/10 text-primary pointer-events-none flex size-12 items-center justify-center rounded-xl",
            error && "bg-destructive/10 text-destructive",
          )}
        >
          <UploadIcon aria-hidden="true" className="size-6" />
        </span>
        <span className="pointer-events-none space-y-1.5">
          <span className="text-foreground block text-sm font-medium">{dragActive ? dragTitle : title}</span>
          <span id={`${id}-description`} className="text-muted-foreground block text-sm font-normal">
            {description}
          </span>
        </span>
      </Button>
    </>
  );
}
