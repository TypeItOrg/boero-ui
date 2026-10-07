"use client";

import * as React from "react";
import Image from "next/image";
import { ExpandIcon, EyeIcon, FileTextIcon, ImageIcon, XIcon } from "lucide-react";

import { DocumentPdfPreview } from "@features/enrollment-applications/components/document-pdf-preview";
import { Button } from "@common/components/ui/button";
import { cn } from "@common/utils/cn.util";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@common/components/ui/dialog";

export function DocumentFilePreview({
  src,
  name,
  contentType,
  compact = false,
  iconOnly = false,
  className,
}: {
  src: string;
  name: string;
  contentType: string;
  compact?: boolean;
  iconOnly?: boolean;
  className?: string;
}): React.ReactElement {
  const [failed, setFailed] = React.useState(false);
  const onPreviewError = React.useCallback(() => setFailed(true), []);
  const isImage = contentType === "image/png" || contentType === "image/jpeg";
  const isPdf = contentType === "application/pdf";

  function content(expanded: boolean): React.ReactNode {
    if (failed || (!isImage && !isPdf)) {
      return (
        <div className="flex h-full flex-col items-center justify-center gap-3 p-4 text-center text-sm">
          <p className="text-muted-foreground">No se pudo mostrar la vista previa.</p>
          {failed ? (
            <Button type="button" variant="outline" onClick={() => setFailed(false)}>
              Reintentar
            </Button>
          ) : null}
        </div>
      );
    }

    if (isImage) {
      return (
        <Image
          src={src}
          alt={`Vista previa de ${name}`}
          width={1200}
          height={900}
          unoptimized
          className="h-full w-full object-contain"
          onError={onPreviewError}
        />
      );
    }

    return <DocumentPdfPreview key={src} src={src} name={name} expanded={expanded} onError={onPreviewError} />;
  }

  return (
    <Dialog>
      {iconOnly ? (
        <DialogTrigger asChild>
          <Button type="button" variant="ghost" size="icon-lg" className="size-11 shrink-0" aria-label={`Ver ${name}`} title="Ver documento">
            <EyeIcon aria-hidden="true" />
          </Button>
        </DialogTrigger>
      ) : (
        <div
          className={cn(
            compact
              ? "bg-background relative -m-1.5 size-12 shrink-0 overflow-hidden rounded-md p-1.5"
              : "bg-background relative aspect-[4/3] w-full max-w-xs overflow-hidden rounded-lg border",
            className,
          )}
        >
          {compact && failed ? <span className="text-muted-foreground text-xs">Ver</span> : content(false)}
          {compact || (!failed && (isImage || isPdf)) ? (
            <DialogTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                className={
                  compact
                    ? "hover:bg-primary/5 absolute inset-0 h-full w-full rounded-md p-0 focus-visible:ring-inset"
                    : "group absolute inset-0 h-full w-full flex-col justify-end rounded-lg p-3 hover:bg-transparent focus-visible:ring-inset"
                }
                aria-label={`Ampliar vista previa de ${name}`}
              >
                {!compact ? (
                  <span className="bg-background/95 text-foreground flex items-center gap-2 rounded-md border px-3 py-2 text-xs shadow-sm">
                    <ExpandIcon aria-hidden="true" />
                    Ampliar vista previa
                  </span>
                ) : null}
              </Button>
            </DialogTrigger>
          ) : null}
        </div>
      )}
      <DialogContent
        showCloseButton={false}
        className="h-[min(52rem,calc(100dvh-2rem))] grid-rows-[auto_minmax(0,1fr)_auto] gap-0 overflow-hidden p-0 sm:max-w-5xl"
      >
        <div className="flex min-w-0 items-start gap-3 p-4 sm:gap-4 sm:p-5">
          <div className="bg-primary/10 text-primary flex size-11 shrink-0 items-center justify-center rounded-xl">
            {isImage ? <ImageIcon className="size-5" aria-hidden="true" /> : <FileTextIcon className="size-5" aria-hidden="true" />}
          </div>
          <DialogHeader className="min-w-0 flex-1 gap-1">
            <div className="flex flex-wrap items-center gap-2">
              <DialogTitle className="leading-snug">Vista previa</DialogTitle>
              {isImage || isPdf ? (
                <span className="text-muted-foreground rounded-md border px-1.5 py-0.5 text-[10px] font-medium tracking-wide">
                  {isPdf ? "PDF" : contentType === "image/png" ? "PNG" : "JPG"}
                </span>
              ) : null}
            </div>
            <DialogDescription className="line-clamp-2 break-all" title={name}>
              {name}
            </DialogDescription>
          </DialogHeader>
          <DialogClose asChild>
            <Button type="button" variant="ghost" size="icon-lg" className="size-11 shrink-0" aria-label="Cerrar vista previa">
              <XIcon aria-hidden="true" />
            </Button>
          </DialogClose>
        </div>
        <div className="bg-muted/40 min-h-0 overflow-hidden border-y p-3 sm:p-5">{content(true)}</div>
        <DialogFooter className="mx-0 mb-0 flex-row items-center justify-end gap-3 border-t-0 sm:justify-end">
          <Button asChild variant="outline" size="lg" className="w-full sm:w-auto">
            <a href={src} target="_blank" rel="noreferrer" aria-label={`Abrir ${name} en otra pestaña`}>
              Abrir archivo
            </a>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
