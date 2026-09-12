import { FingerprintIcon, Loader2Icon } from "lucide-react";

import { Button } from "@common/components/ui/button";

type InstitutionalPasskeyPromptProps = {
  pending: boolean;
  verifying: boolean;
  supported: boolean;
  onContinue: () => void;
  onCancel: () => void;
  onUsePassword: () => void;
};

export function InstitutionalPasskeyPrompt({
  pending,
  verifying,
  supported,
  onContinue,
  onCancel,
  onUsePassword,
}: InstitutionalPasskeyPromptProps): React.ReactElement {
  return (
    <section aria-labelledby="passkey-prompt-title" className="border-primary/10 bg-primary/3 @container rounded-xl border p-4 sm:p-5">
      <div className="flex items-stretch gap-3">
        <div className="bg-primary/8 text-primary hidden shrink-0 items-center justify-center rounded-xl px-3 @min-[22rem]:flex">
          <FingerprintIcon aria-hidden="true" className="size-6" />
        </div>
        <div className="min-w-0">
          <h2 id="passkey-prompt-title" className="text-sm leading-6 font-semibold @min-[15rem]:text-base">
            Ingresá con tu llave de acceso
          </h2>
          <p className="text-muted-foreground hidden text-sm leading-relaxed @min-[15rem]:block">Confirmá tu identidad con tu dispositivo.</p>
        </div>
      </div>
      <footer className="mt-5 flex flex-col gap-2 @min-[18rem]:flex-row @min-[18rem]:items-center @min-[18rem]:justify-between">
        <Button
          className="w-full px-3 @min-[18rem]:w-auto"
          disabled={verifying}
          onClick={pending ? onCancel : onUsePassword}
          size="lg"
          type="button"
          variant="outline"
        >
          {pending ? "Cancelar" : "Usar contraseña"}
        </Button>
        <Button
          aria-busy={pending}
          aria-label="Continuar"
          className="relative w-full min-w-28 px-5 @min-[18rem]:w-auto"
          disabled={pending || !supported}
          onClick={onContinue}
          size="lg"
          type="button"
        >
          <span className={pending ? "opacity-0" : undefined}>Continuar</span>
          {pending ? (
            <span className="absolute inset-0 flex items-center justify-center">
              <Loader2Icon aria-hidden="true" className="size-4 animate-spin" />
              <span className="sr-only" role="status" aria-live="polite">
                Procesando...
              </span>
            </span>
          ) : null}
        </Button>
      </footer>
    </section>
  );
}
