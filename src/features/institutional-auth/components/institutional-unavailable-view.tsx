"use client";

import type { ReactElement } from "react";

import { Building2Icon, HouseIcon, RefreshCwIcon } from "lucide-react";

import { Button } from "@common/components/ui/button";
import { Card } from "@common/components/ui/card";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@common/components/ui/empty";

type InstitutionalUnavailableViewProps = {
  message?: string;
  homeHref?: string;
  onRetry?: () => void;
};

export function InstitutionalUnavailableView({
  message = "Verificá que el enlace o subdominio ingresado sea correcto, o comunicate con la institución para acceder al portal correspondiente.",
  homeHref = "/",
  onRetry,
}: InstitutionalUnavailableViewProps): ReactElement {
  const handleRetry = (): void => {
    if (onRetry) {
      onRetry();

      return;
    }

    window.location.reload();
  };

  return (
    <main className="bg-muted flex min-h-dvh flex-1 items-center justify-center p-6">
      <Card className="bg-background w-full max-w-lg p-6 md:p-8">
        <Empty className="border-0 p-0">
          <EmptyHeader className="max-w-md">
            <EmptyMedia variant="icon" className="bg-destructive/10 text-destructive mb-4 size-16 rounded-full">
              <Building2Icon className="size-8" />
            </EmptyMedia>
            <EmptyTitle className="text-lg">Acceso institucional no disponible</EmptyTitle>
            <EmptyDescription>{message}</EmptyDescription>
          </EmptyHeader>

          <EmptyContent className="flex-row justify-center">
            <Button type="button" size="lg" onClick={handleRetry}>
              <RefreshCwIcon data-icon="inline-start" />
              Reintentar
            </Button>
            <Button variant="outline" size="lg" asChild>
              <a href={homeHref}>
                <HouseIcon data-icon="inline-start" />
                Ir al inicio
              </a>
            </Button>
          </EmptyContent>
        </Empty>
      </Card>
    </main>
  );
}
