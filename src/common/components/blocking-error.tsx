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
import { COMMON_ERROR_MESSAGES } from "@common/constants/error-messages.constants";
import { cn } from "@common/utils/cn.util";

type BlockingErrorProps = {
  error?: Error & { digest?: string };
  reset: () => void;
  className?: string;
  title?: string;
  description?: string;
};

export function BlockingError({
  reset,
  className,
  title = COMMON_ERROR_MESSAGES.BLOCKING_PAGE_TITLE,
  description = COMMON_ERROR_MESSAGES.BLOCKING_PAGE_DESCRIPTION,
}: BlockingErrorProps): React.ReactElement {
  return (
    <main className={cn("bg-muted flex min-h-full flex-1 items-center justify-center p-6", className)}>
      <Card className="bg-background w-full max-w-lg p-6 md:p-8">
        <Empty className="border-0 p-0">
          <EmptyHeader>
            <EmptyMedia variant="icon" className="bg-destructive/10 text-destructive mb-4 size-16 rounded-full">
              <ServerCrashIcon className="size-8" />
            </EmptyMedia>
            <EmptyTitle className="text-lg">{title}</EmptyTitle>
            <EmptyDescription>{description}</EmptyDescription>
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
