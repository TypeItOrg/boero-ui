"use client";

import type { ReactElement } from "react";

import { Loader2Icon } from "lucide-react";

import { Button } from "@common/components/ui/button";
import { cn } from "@common/utils/cn.util";

export function InstitutionalRegistrationSubmitButton({ isPending }: { isPending: boolean }): ReactElement {
  return (
    <Button aria-busy={isPending} className="relative w-full" disabled={isPending} size="lg" type="submit">
      <span className={cn("inline-flex items-center gap-[inherit] transition-opacity", isPending && "opacity-0")}>Crear cuenta</span>
      {isPending ? (
        <span className="pointer-events-none absolute inset-0 flex items-center justify-center rounded-[inherit]">
          <Loader2Icon aria-hidden="true" className="animate-spin" />
          <span className="sr-only" role="status" aria-live="polite">
            Registrando...
          </span>
        </span>
      ) : null}
    </Button>
  );
}
