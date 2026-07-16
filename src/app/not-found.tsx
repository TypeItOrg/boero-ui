import type { Metadata } from "next";
import Link from "next/link";
import { HouseIcon, SearchXIcon } from "lucide-react";

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

export const metadata: Metadata = {
  title: "Página no encontrada",
  description: "La página que estás buscando no existe o cambió de ubicación.",
};

export default function NotFound(): React.ReactElement {
  return (
    <main className="bg-muted flex min-h-dvh flex-1 items-center justify-center p-6">
      <Card className="bg-background w-full max-w-lg p-6 md:p-8">
        <Empty className="border-0 p-0">
          <EmptyHeader>
            <EmptyMedia variant="icon" className="mb-4 size-16 rounded-full">
              <SearchXIcon className="size-8" />
            </EmptyMedia>
            <EmptyTitle className="text-lg">Página no encontrada</EmptyTitle>
            <EmptyDescription>
              La página que estás buscando no existe, fue movida o la dirección ingresada no es correcta.
            </EmptyDescription>
          </EmptyHeader>

          <EmptyContent className="flex-row justify-center">
            <Button asChild size="lg">
              <Link href="/admin">
                <HouseIcon data-icon="inline-start" />
                Ir al inicio
              </Link>
            </Button>
          </EmptyContent>
        </Empty>
      </Card>
    </main>
  );
}
