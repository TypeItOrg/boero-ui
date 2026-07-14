"use client";

import { HouseIcon, RefreshCwIcon, ServerCrashIcon } from "lucide-react";

import { Button } from "@common/components/ui/button";
import { Card } from "@common/components/ui/card";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@common/components/ui/empty";
import { cn } from "@common/utils/cn.util";

type BlockingErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
  className?: string;
};

export function BlockingError({ reset, className }: BlockingErrorProps): React.ReactElement {
  return (
    <main className={cn("bg-muted flex min-h-full flex-1 items-center justify-center p-6", className)}>
      <Card className="bg-background w-full max-w-lg p-6 md:p-8">
        <Empty className="border-0 p-0">
          <EmptyHeader>
            <EmptyMedia variant="icon" className="bg-destructive/10 text-destructive mb-4 size-16 rounded-full">
              <ServerCrashIcon className="size-8" />
            </EmptyMedia>
            <EmptyTitle className="text-lg">No pudimos cargar esta página</EmptyTitle>
            <EmptyDescription>
              El servicio puede no estar disponible temporalmente o se produjo un error inesperado. Intentá nuevamente
              en unos momentos.
            </EmptyDescription>
          </EmptyHeader>

          <EmptyContent className="flex-row justify-center">
            <Button type="button" size="lg" onClick={reset}>
              <RefreshCwIcon data-icon="inline-start" />
              Reintentar
            </Button>
            <Button variant="outline" size="lg" asChild>
              <a href="/platform">
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
