"use client";

import type { ReactElement, RefObject } from "react";

import Link from "next/link";

import { CopyIcon } from "lucide-react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@common/components/ui/alert-dialog";

export function DocumentCatalogCopyConfirmation({
  href,
  onClose,
  returnFocusRef,
}: {
  href: string;
  onClose: () => void;
  returnFocusRef: RefObject<HTMLButtonElement | null>;
}): ReactElement {
  return (
    <AlertDialog
      open
      onOpenChange={(open) => {
        if (!open) {
          onClose();
        }
      }}
    >
      <AlertDialogContent
        className="max-h-[calc(100dvh-2rem)] overflow-y-auto sm:max-w-md"
        onCloseAutoFocus={(event) => {
          event.preventDefault();
          returnFocusRef.current?.focus();
        }}
      >
        <AlertDialogHeader>
          <div className="bg-primary/10 text-primary mb-1 flex size-12 items-center justify-center rounded-2xl">
            <CopyIcon className="size-6" aria-hidden="true" />
          </div>
          <AlertDialogTitle>¿Crear copia en otra institución?</AlertDialogTitle>
          <AlertDialogDescription className="leading-relaxed">
            Se copiará la configuración guardada, sin trayectos ni datos de inscripciones. El documento original no se modifica.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel size="lg">Cancelar</AlertDialogCancel>
          <AlertDialogAction size="lg" asChild>
            <Link href={href}>Continuar con la copia</Link>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
