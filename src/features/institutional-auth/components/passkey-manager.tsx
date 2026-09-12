"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { FingerprintIcon, PencilIcon, PlusIcon, Trash2Icon } from "lucide-react";
import { Button } from "@common/components/ui/button";
import { PasskeyRegistrationDialog } from "@features/institutional-auth/components/passkey-registration-dialog";
import { PasskeyRenameDialog } from "@features/institutional-auth/components/passkey-rename-dialog";
import { PasskeyRevokeDialog } from "@features/institutional-auth/components/passkey-revoke-dialog";
import { PasskeyReauthDialog } from "@features/institutional-auth/components/passkey-reauth-dialog";
import { revokePasskeyAction } from "@features/institutional-auth/actions/passkey-management.actions";
import { useWebAuthnSupport } from "@features/institutional-auth/hooks/use-webauthn-support.hook";
import type { Passkey } from "@features/institutional-auth/types/passkey.types";
import type { ReAuthenticateState } from "@features/institutional-auth/types/re-authenticate-state.types";

type PasskeyOperation = { kind: "register"; label: string } | { kind: "revoke"; passkey: Passkey };
type PasskeyDialog = PasskeyOperation | { kind: "rename"; passkey: Passkey } | { kind: "reauth"; next: PasskeyOperation };

type PasskeyManagerProps = { initialPasskeys: Passkey[]; maxActivePasskeys: number };

export function PasskeyManager({ initialPasskeys, maxActivePasskeys }: PasskeyManagerProps): React.ReactElement {
  const router = useRouter();
  const [dialog, setDialog] = useState<PasskeyDialog | null>(null);
  const webauthnSupported = useWebAuthnSupport();

  function close(): void {
    setDialog(null);
  }

  function complete(): void {
    close();
    router.refresh();
  }

  async function resumeOperation(next: PasskeyOperation): Promise<ReAuthenticateState> {
    if (next.kind === "register") {
      setDialog(next);
      return {};
    }
    const result = await revokePasskeyAction(next.passkey.id);
    if (result.error) return result;
    complete();
    return {};
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="bg-muted/25 rounded-xl border p-4 sm:p-5">
        <header className="-mx-4 flex flex-wrap items-center justify-between gap-3 border-b px-4 pb-4 sm:-mx-5 sm:px-5 sm:pb-5">
          <div className="flex items-center gap-3.5">
            <div className="bg-primary/10 text-primary flex aspect-square min-h-11 min-w-11 shrink-0 items-center justify-center self-stretch rounded-xl">
              <FingerprintIcon className="size-5" aria-hidden="true" />
            </div>
            <div>
              <h2 className="text-base font-semibold">Tus claves de acceso</h2>
              <p className="text-muted-foreground text-sm">
                {initialPasskeys.length === 0
                  ? "Todavía no registraste ninguna clave de acceso."
                  : `${initialPasskeys.length} de ${maxActivePasskeys} claves de acceso en uso.`}
              </p>
            </div>
          </div>
          <Button
            className="w-full sm:w-auto"
            disabled={initialPasskeys.length >= maxActivePasskeys || !webauthnSupported}
            onClick={() => setDialog({ kind: "register", label: "" })}
            size="lg"
            type="button"
          >
            <PlusIcon aria-hidden="true" className="size-4" />
            Añadir clave de acceso
          </Button>
        </header>

        {webauthnSupported === false ? (
          <p className="text-muted-foreground mt-4 text-sm">
            Tu navegador no puede crear claves de acceso. Podés ver, renombrar o eliminar las que ya tenés desde otro dispositivo.
          </p>
        ) : null}

        <div className="mt-4 sm:mt-5">
          {initialPasskeys.length === 0 ? (
            <p className="text-muted-foreground text-sm">Registrá una clave de acceso para iniciar sesión sin contraseña usando tu dispositivo.</p>
          ) : (
            <ul className="flex flex-col gap-3">
              {initialPasskeys.map((passkey) => (
                <li key={passkey.id} className="bg-background flex flex-wrap items-center justify-between gap-3 rounded-lg border p-3">
                  <div className="min-w-0">
                    <p className="font-medium wrap-break-word">{passkey.label}</p>
                    <p className="text-muted-foreground text-sm">
                      Creada {formatDate(passkey.createdAt)} ·{" "}
                      {passkey.lastUsedAt ? `Último uso ${formatDate(passkey.lastUsedAt)}` : "Sin usar todavía"}
                    </p>
                  </div>
                  <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto">
                    <Button
                      className="flex-1 sm:flex-none"
                      onClick={() => setDialog({ kind: "rename", passkey })}
                      size="lg"
                      type="button"
                      variant="outline"
                    >
                      <PencilIcon aria-hidden="true" className="size-4" />
                      Renombrar
                    </Button>
                    <Button
                      className="flex-1 sm:flex-none"
                      onClick={() => setDialog({ kind: "revoke", passkey })}
                      size="lg"
                      type="button"
                      variant="destructive"
                    >
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

      {dialog?.kind === "register" ? (
        <PasskeyRegistrationDialog
          initialLabel={dialog.label}
          onClose={close}
          onSuccess={complete}
          onRequireReauth={(label) => setDialog({ kind: "reauth", next: { kind: "register", label } })}
        />
      ) : null}
      {dialog?.kind === "rename" ? <PasskeyRenameDialog passkey={dialog.passkey} onClose={close} onSuccess={complete} /> : null}
      {dialog?.kind === "revoke" ? (
        <PasskeyRevokeDialog
          passkey={dialog.passkey}
          onClose={close}
          onSuccess={complete}
          onRequireReauth={() => setDialog({ kind: "reauth", next: dialog })}
        />
      ) : null}
      {dialog?.kind === "reauth" ? <PasskeyReauthDialog onClose={close} onVerified={() => resumeOperation(dialog.next)} /> : null}
    </div>
  );
}
function formatDate(value: string | null): string {
  if (!value) return "fecha desconocida";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "fecha desconocida";

  return date.toLocaleDateString("es-AR", { day: "2-digit", month: "2-digit", year: "numeric" });
}
