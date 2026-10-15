"use client";

import { useActionState, type ReactElement } from "react";

import { LogOutIcon } from "lucide-react";

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@common/components/ui/alert-dialog";
import { Button } from "@common/components/ui/button";

import { logoutInstitutional } from "@features/institutional-auth/actions/institutional-logout.action";

type InstitutionalLogoutDialogProps = {
  onClose: () => void;
};

export function InstitutionalLogoutDialog({ onClose }: InstitutionalLogoutDialogProps): ReactElement {
  const [, action, isPending] = useActionState<null, FormData>(async () => {
    await logoutInstitutional();

    return null;
  }, null);

  return (
    <AlertDialog
      open
      onOpenChange={(open) => {
        if (!open && !isPending) {
          onClose();
        }
      }}
    >
      <AlertDialogContent>
        <form action={action}>
          <AlertDialogHeader>
            <div className="bg-destructive/10 text-destructive mb-1 flex size-12 items-center justify-center rounded-2xl">
              <LogOutIcon aria-hidden="true" className="size-6" />
            </div>
            <AlertDialogTitle>Cerrar sesión</AlertDialogTitle>
            <AlertDialogDescription>¿Querés cerrar tu sesión? Vas a tener que volver a ingresar para acceder a tu cuenta.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-5">
            <AlertDialogCancel disabled={isPending} type="button">
              Cancelar
            </AlertDialogCancel>
            <Button disabled={isPending} type="submit" variant="destructive">
              {isPending ? "Cerrando sesión…" : "Cerrar sesión"}
            </Button>
          </AlertDialogFooter>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  );
}
