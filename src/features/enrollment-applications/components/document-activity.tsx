"use client";

import type { ReactElement } from "react";

import { CircleAlertIcon, HistoryIcon, XIcon } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@common/components/ui/alert";
import { Badge } from "@common/components/ui/badge";
import { Button } from "@common/components/ui/button";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@common/components/ui/empty";
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@common/components/ui/sheet";
import { Skeleton } from "@common/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@common/components/ui/tabs";

import { Delivery } from "@features/enrollment-applications/components/document-delivery";
import { DocumentChanges } from "@features/enrollment-applications/components/document-requirement-changes";
import { useDocumentDeliveryHistory } from "@features/enrollment-applications/hooks/use-document-delivery-history";
import type { DocumentActivityProps } from "@features/enrollment-applications/types/document-activity-props.types";

export function DocumentActivity({
  applicationId,
  scope,
  requirement,
  initialTab,
  showRequirementChanges,
  onClose,
  onReturnFocus,
}: DocumentActivityProps): ReactElement {
  const { page, loading, error, history, setError, setLoading, setRetry, changePage } = useDocumentDeliveryHistory(
    applicationId,
    scope,
    requirement.id,
  );

  const deliveries = (
    <>
      {loading ? (
        <div role="status" className="space-y-5">
          <span className="sr-only">Cargando entregas…</span>
          {[0, 1].map((item) => (
            <div key={item} className="space-y-3">
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-3/4" />
            </div>
          ))}
        </div>
      ) : error ? (
        <Alert variant="destructive">
          <CircleAlertIcon />
          <AlertTitle>No se pudo cargar el historial</AlertTitle>
          <AlertDescription>
            {error}
            <Button
              type="button"
              variant="outline"
              className="mt-3 min-h-11 w-fit"
              onClick={() => {
                setError("");
                setLoading(true);
                setRetry((value) => value + 1);
              }}
            >
              Reintentar
            </Button>
          </AlertDescription>
        </Alert>
      ) : history.items.length > 0 ? (
        <ol className="divide-y">
          {history.items.map((file) => (
            <li key={file.id} className="space-y-3 py-5 first:pt-0">
              <div className="flex items-center gap-2">
                <Badge variant={file.versionStatus === "CURRENT" ? "secondary" : "outline"}>
                  {file.versionStatus === "CURRENT" ? "Entrega vigente" : file.versionStatus === "SUPERSEDED" ? "Reemplazada" : "Retirada"}
                </Badge>
              </div>
              <Delivery file={file} applicationId={applicationId} scope={scope} showReviewStatus />
            </li>
          ))}
        </ol>
      ) : (
        <Empty className="py-12">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <HistoryIcon aria-hidden="true" />
            </EmptyMedia>
            <EmptyTitle>Todavía no hay entregas</EmptyTitle>
            <EmptyDescription>Cuando se presente un archivo, sus versiones van a aparecer acá.</EmptyDescription>
          </EmptyHeader>
        </Empty>
      )}
      {!loading && !error && history.totalPages > 1 ? (
        <div className="mt-3 flex items-center justify-between gap-3 border-t pt-4">
          <Button type="button" variant="outline" className="min-h-11" disabled={page === 0} onClick={() => changePage(page - 1)}>
            Anterior
          </Button>
          <span className="text-muted-foreground text-xs">
            Página {page + 1} de {history.totalPages}
          </span>
          <Button type="button" variant="outline" className="min-h-11" disabled={page + 1 >= history.totalPages} onClick={() => changePage(page + 1)}>
            Siguiente
          </Button>
        </div>
      ) : null}
    </>
  );

  return (
    <Sheet
      open
      onOpenChange={(open) => {
        if (!open) {
          onClose();
        }
      }}
    >
      <SheetContent
        onCloseAutoFocus={(event) => {
          event.preventDefault();
          onReturnFocus();
        }}
        showCloseButton={false}
        className="gap-0 data-[side=right]:w-full data-[side=right]:sm:max-w-xl"
      >
        <SheetHeader className="gap-2 border-b p-5 pr-16">
          <SheetTitle className="text-lg font-semibold">Historial del documento</SheetTitle>
          <SheetDescription className="break-words">{requirement.name}</SheetDescription>
        </SheetHeader>
        <SheetClose asChild>
          <Button type="button" variant="ghost" size="icon-lg" className="absolute top-4 right-4 size-11" aria-label="Cerrar historial">
            <XIcon aria-hidden="true" />
          </Button>
        </SheetClose>
        {showRequirementChanges ? (
          <Tabs defaultValue={initialTab} className="min-h-0 flex-1 gap-0">
            <div className="border-b px-5 py-3">
              <TabsList className="w-full group-data-horizontal/tabs:h-auto" aria-label="Tipo de historial">
                <TabsTrigger className="min-h-11" value="deliveries">
                  Entregas
                </TabsTrigger>
                <TabsTrigger className="min-h-11" value="changes">
                  Cambios del requisito
                </TabsTrigger>
              </TabsList>
            </div>
            <TabsContent value="deliveries" className="min-h-0 overflow-y-auto p-5" aria-busy={loading}>
              {deliveries}
            </TabsContent>
            <TabsContent value="changes" className="min-h-0 overflow-y-auto p-5">
              <DocumentChanges requirement={requirement} />
            </TabsContent>
          </Tabs>
        ) : (
          <div className="min-h-0 flex-1 overflow-y-auto p-5" aria-label="Historial de entregas" aria-busy={loading}>
            {deliveries}
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
