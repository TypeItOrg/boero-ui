"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { FingerprintIcon, Loader2Icon, PencilIcon, PlusIcon, Trash2Icon } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@common/components/ui/alert";
import { Button } from "@common/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@common/components/ui/dialog";
import { Field, FieldError, FieldLabel } from "@common/components/ui/field";
import { Input } from "@common/components/ui/input";
import { PasswordInput } from "@common/components/ui/password-input";
import { reAuthenticateAction, renamePasskeyAction, revokePasskeyAction } from "@features/institutional-auth/actions/passkey-management.actions";
import { requestPasskeyRegistration, verifyPasskeyRegistrationAction } from "@features/institutional-auth/actions/passkey-registration.actions";
import { RECENT_AUTH_REQUIRED } from "@features/institutional-auth/constants/passkey.constants";
import type { Passkey } from "@features/institutional-auth/types/passkey.types";
import { createPasskeyCredential, toPublicKeyCreationOptions } from "@features/institutional-auth/utils/passkey-registration.util";
import { isUserCancelled } from "@features/institutional-auth/utils/passkey-authentication.util";
import { useWebAuthnSupport } from "@features/institutional-auth/hooks/use-webauthn-support.hook";

type PasskeyManagerProps = {
  initialPasskeys: Passkey[];
  maxActivePasskeys: number;
};

type PendingAction = { kind: "register" } | { kind: "revoke"; id: string } | null;

export function PasskeyManager({ initialPasskeys, maxActivePasskeys }: PasskeyManagerProps): React.ReactElement {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [label, setLabel] = useState("");
  const [labelError, setLabelError] = useState<string | null>(null);
  const [registering, setRegistering] = useState(false);
  const [renameTarget, setRenameTarget] = useState<Passkey | null>(null);
  const [renameLabel, setRenameLabel] = useState("");
  const [renameError, setRenameError] = useState<string | null>(null);
  const [renaming, setRenaming] = useState(false);
  const [revokeTarget, setRevokeTarget] = useState<Passkey | null>(null);
  const [reauthOpen, setReauthOpen] = useState(false);
  const [reauthPassword, setReauthPassword] = useState("");
  const [reauthError, setReauthError] = useState<string | null>(null);
  const [reauthenticating, setReauthenticating] = useState(false);
  const [pendingAction, setPendingAction] = useState<PendingAction>(null);
  const webauthnSupported = useWebAuthnSupport();
  const ceremonyRef = useRef<AbortController | null>(null);

  useEffect(() => {
    return () => {
      ceremonyRef.current?.abort();
      ceremonyRef.current = null;
    };
  }, []);

  function refresh(): void {
    router.refresh();
  }

  function openReauth(next: NonNullable<PendingAction>): void {
    setPendingAction(next);
    setReauthPassword("");
    setReauthError(null);
    setReauthOpen(true);
  }

  function abortCeremony(): void {
    ceremonyRef.current?.abort();
    ceremonyRef.current = null;
  }

  function handleCancelAdd(): void {
    abortCeremony();
    setRegistering(false);
    setLabelError(null);
    setAddOpen(false);
  }

  async function handleAddSubmit(event: React.FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();

    if (ceremonyRef.current) return;

    setLabelError(null);
    setError(null);

    const trimmed = label.trim();

    if (trimmed.length === 0 || trimmed.length > 100) {
      setLabelError("El nombre debe tener entre 1 y 100 caracteres.");
      return;
    }

    if (!webauthnSupported) {
      setLabelError("Las passkeys no están disponibles en este navegador.");
      return;
    }

    setRegistering(true);

    const controller = new AbortController();
    ceremonyRef.current = controller;

    try {
      const formData = new FormData();
      formData.set("label", trimmed);
      const optionsState = await requestPasskeyRegistration({}, formData);

      if (ceremonyRef.current !== controller) return;

      if (optionsState.fieldErrors?.label) {
        setLabelError(optionsState.fieldErrors.label);
        return;
      }

      if (optionsState.error === RECENT_AUTH_REQUIRED) {
        setAddOpen(false);
        openReauth({ kind: "register" });
        return;
      }

      if (optionsState.error || !optionsState.ceremonyId || !optionsState.options) {
        setLabelError(optionsState.error ?? "No se pudo iniciar el registro de la passkey.");
        return;
      }

      const creationOptions = toPublicKeyCreationOptions(optionsState.options);
      const credential = await createPasskeyCredential(creationOptions, controller.signal);

      if (ceremonyRef.current !== controller) return;

      const verifyState = await verifyPasskeyRegistrationAction(optionsState.ceremonyId, credential);

      if (ceremonyRef.current !== controller) return;

      if (verifyState.error === RECENT_AUTH_REQUIRED) {
        setAddOpen(false);
        openReauth({ kind: "register" });
        return;
      }

      if (verifyState.error) {
        setLabelError(verifyState.error);
        return;
      }

      setAddOpen(false);
      setLabel("");
      refresh();
    } catch (unknown) {
      if (process.env.NODE_ENV === "development") {
        console.debug(
          "[passkey] registration ceremony settled with error",
          unknown instanceof DOMException ? unknown.name : unknown?.constructor?.name,
        );
      }

      if (ceremonyRef.current !== controller) return;

      if (isUserCancelled(unknown)) {
        return;
      }

      setLabelError("No se pudo registrar la passkey.");
    } finally {
      if (ceremonyRef.current === controller) {
        ceremonyRef.current = null;
        setRegistering(false);
      }
    }
  }

  async function handleRenameSubmit(event: React.FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();

    if (!renameTarget || renaming) return;

    setRenameError(null);
    setRenaming(true);

    try {
      const formData = new FormData();
      formData.set("label", renameLabel);
      const state = await renamePasskeyAction(renameTarget.id, {}, formData);

      if (state.fieldErrors?.label) {
        setRenameError(state.fieldErrors.label);
        return;
      }

      if (state.error) {
        setRenameError(state.error);
        return;
      }

      setRenameTarget(null);
      refresh();
    } finally {
      setRenaming(false);
    }
  }

  function handleRevokeConfirm(): void {
    if (!revokeTarget) return;

    const target = revokeTarget;
    setRevokeTarget(null);

    startTransition(async () => {
      const state = await revokePasskeyAction(target.id);

      if (state.error === RECENT_AUTH_REQUIRED) {
        openReauth({ kind: "revoke", id: target.id });
        return;
      }

      if (state.error) {
        setError(state.error);
        return;
      }

      refresh();
    });
  }

  async function handleReauthSubmit(event: React.FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();

    if (reauthenticating) return;

    setReauthError(null);
    setReauthenticating(true);

    try {
      const formData = new FormData();
      formData.set("password", reauthPassword);
      const state = await reAuthenticateAction({}, formData);

      if (state.fieldErrors?.password) {
        setReauthError(state.fieldErrors.password);
        return;
      }

      if (state.error) {
        setReauthError(state.error);
        return;
      }
    } finally {
      setReauthenticating(false);
    }

    setReauthOpen(false);
    const next = pendingAction;
    setPendingAction(null);

    if (next?.kind === "revoke") {
      startTransition(async () => {
        const retry = await revokePasskeyAction(next.id);

        if (retry.error) {
          setError(retry.error);
          return;
        }

        refresh();
      });
    }

    if (next?.kind === "register") {
      setAddOpen(true);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {error ? (
        <Alert variant="destructive">
          <AlertTitle>¡Ups! Algo salió mal</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      <div className="bg-muted/25 rounded-xl border p-4 sm:p-5">
        <header className="-mx-4 flex flex-wrap items-center justify-between gap-3 border-b px-4 pb-4 sm:-mx-5 sm:px-5 sm:pb-5">
          <div className="flex items-center gap-3.5">
            <div className="bg-primary/10 text-primary flex aspect-square min-h-11 min-w-11 shrink-0 items-center justify-center self-stretch rounded-xl">
              <FingerprintIcon className="size-5" aria-hidden="true" />
            </div>
            <div>
              <h2 className="text-base font-semibold">Tus passkeys</h2>
              <p className="text-muted-foreground text-sm">
                {initialPasskeys.length === 0
                  ? "Todavía no registraste ninguna passkey."
                  : `${initialPasskeys.length} de ${maxActivePasskeys} passkeys en uso.`}
              </p>
            </div>
          </div>
          <Button
            disabled={initialPasskeys.length >= maxActivePasskeys || !webauthnSupported}
            onClick={() => {
              setLabel("");
              setLabelError(null);
              setAddOpen(true);
            }}
            size="lg"
            type="button"
          >
            <PlusIcon aria-hidden="true" className="size-4" />
            Añadir passkey
          </Button>
        </header>

        {!webauthnSupported ? (
          <p className="text-muted-foreground mt-4 text-sm">
            Tu navegador no puede crear passkeys. Podés ver, renombrar o eliminar las que ya tenés desde otro dispositivo.
          </p>
        ) : null}

        <div className="mt-4 sm:mt-5">
          {initialPasskeys.length === 0 ? (
            <p className="text-muted-foreground text-sm">Registrá una passkey para iniciar sesión sin contraseña usando tu dispositivo.</p>
          ) : (
            <ul className="flex flex-col gap-3">
              {initialPasskeys.map((passkey) => (
                <li key={passkey.id} className="bg-background flex flex-wrap items-center justify-between gap-3 rounded-lg border p-3">
                  <div>
                    <p className="font-medium">{passkey.label}</p>
                    <p className="text-muted-foreground text-xs">
                      Creada {formatDate(passkey.createdAt)} ·{" "}
                      {passkey.lastUsedAt ? `Último uso ${formatDate(passkey.lastUsedAt)}` : "Sin usar todavía"}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      onClick={() => {
                        setRenameTarget(passkey);
                        setRenameLabel(passkey.label);
                        setRenameError(null);
                      }}
                      size="sm"
                      type="button"
                      variant="outline"
                    >
                      <PencilIcon aria-hidden="true" className="size-4" />
                      Renombrar
                    </Button>
                    <Button disabled={isPending} onClick={() => setRevokeTarget(passkey)} size="sm" type="button" variant="destructive">
                      <Trash2Icon aria-hidden="true" className="size-4" />
                      Eliminar
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {addOpen ? (
        <Dialog
          onOpenChange={(open) => {
            if (!open) handleCancelAdd();
          }}
          open={addOpen}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Añadir passkey</DialogTitle>
              <DialogDescription>Elegí un nombre para reconocer esta passkey en tus dispositivos.</DialogDescription>
            </DialogHeader>
            <form className="flex flex-col gap-4" onSubmit={(event) => void handleAddSubmit(event)}>
              <Field data-invalid={!!labelError}>
                <FieldLabel htmlFor="passkey-label" required>
                  Nombre
                </FieldLabel>
                <Input disabled={registering} id="passkey-label" maxLength={100} onChange={(event) => setLabel(event.target.value)} value={label} />
                <FieldError>{labelError}</FieldError>
              </Field>
              <DialogFooter>
                <Button onClick={handleCancelAdd} type="button" variant="outline">
                  Cancelar
                </Button>
                <Button disabled={registering} type="submit">
                  {registering ? (
                    <>
                      <Loader2Icon aria-hidden="true" className="animate-spin" />
                      Registrando...
                    </>
                  ) : (
                    "Continuar"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      ) : null}

      {renameTarget ? (
        <Dialog
          onOpenChange={(open) => {
            if (!open) setRenameTarget(null);
          }}
          open={!!renameTarget}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Renombrar passkey</DialogTitle>
            </DialogHeader>
            <form className="flex flex-col gap-4" onSubmit={(event) => void handleRenameSubmit(event)}>
              <Field data-invalid={!!renameError}>
                <FieldLabel htmlFor="passkey-rename" required>
                  Nombre
                </FieldLabel>
                <Input
                  disabled={renaming}
                  id="passkey-rename"
                  maxLength={100}
                  onChange={(event) => setRenameLabel(event.target.value)}
                  value={renameLabel}
                />
                <FieldError>{renameError}</FieldError>
              </Field>
              <DialogFooter>
                <Button disabled={renaming} onClick={() => setRenameTarget(null)} type="button" variant="outline">
                  Cancelar
                </Button>
                <Button disabled={renaming} type="submit">
                  Guardar
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      ) : null}

      {revokeTarget ? (
        <Dialog
          onOpenChange={(open) => {
            if (!open) setRevokeTarget(null);
          }}
          open={!!revokeTarget}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Eliminar passkey</DialogTitle>
              <DialogDescription>Se eliminará «{revokeTarget.label}». Podrás seguir ingresando con tu contraseña u otras passkeys.</DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button onClick={() => setRevokeTarget(null)} type="button" variant="outline">
                Cancelar
              </Button>
              <Button disabled={isPending} onClick={handleRevokeConfirm} type="button" variant="destructive">
                Eliminar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      ) : null}

      {reauthOpen ? (
        <Dialog
          onOpenChange={(open) => {
            if (!open) setReauthOpen(false);
          }}
          open={reauthOpen}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirmá tu identidad</DialogTitle>
              <DialogDescription>Ingresá tu contraseña para continuar. Esta confirmación es válida por unos minutos.</DialogDescription>
            </DialogHeader>
            <form className="flex flex-col gap-4" onSubmit={(event) => void handleReauthSubmit(event)}>
              <Field data-invalid={!!reauthError}>
                <FieldLabel htmlFor="reauth-password" required>
                  Contraseña
                </FieldLabel>
                <PasswordInput
                  autoComplete="current-password"
                  disabled={reauthenticating}
                  id="reauth-password"
                  onChange={(event) => setReauthPassword(event.target.value)}
                  value={reauthPassword}
                />
                <FieldError>{reauthError}</FieldError>
              </Field>
              <DialogFooter>
                <Button disabled={reauthenticating} onClick={() => setReauthOpen(false)} type="button" variant="outline">
                  Cancelar
                </Button>
                <Button disabled={reauthenticating} type="submit">
                  Confirmar
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      ) : null}
    </div>
  );
}

function formatDate(value: string | null): string {
  if (!value) return "fecha desconocida";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "fecha desconocida";

  return date.toLocaleDateString("es-AR", { day: "2-digit", month: "2-digit", year: "numeric" });
}
