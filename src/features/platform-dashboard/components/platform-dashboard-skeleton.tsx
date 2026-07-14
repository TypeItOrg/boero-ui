import { Card, CardContent, CardHeader } from "@common/components/ui/card";
import { Skeleton } from "@common/components/ui/skeleton";

export function PlatformDashboardSkeleton(): React.ReactElement {
  return (
    <div className="flex flex-col gap-5" aria-label="Cargando resumen de la plataforma" role="status">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <Card key={index} className="p-5 sm:p-6">
            <CardHeader className="p-0">
              <Skeleton className="h-4 w-32" />
            </CardHeader>
            <CardContent className="flex flex-col gap-2 p-0">
              <Skeleton className="h-9 w-20" />
              <Skeleton className="h-3 w-40 max-w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="grid gap-5 lg:grid-cols-3">
        <Card className="p-5 sm:p-6 lg:col-span-2">
          <CardHeader className="flex flex-col gap-2 p-0">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-3 w-64 max-w-full" />
          </CardHeader>
          <CardContent className="p-0">
            <Skeleton className="h-72 w-full" />
          </CardContent>
        </Card>
        <Card className="p-5 sm:p-6">
          <CardHeader className="flex flex-col gap-2 p-0">
            <Skeleton className="h-4 w-36" />
            <Skeleton className="h-3 w-48 max-w-full" />
          </CardHeader>
          <CardContent className="flex flex-1 flex-col justify-center p-0">
            <InstitutionStatusSkeleton />
          </CardContent>
        </Card>
      </div>
      <Card className="p-5 sm:p-6">
        <CardHeader className="flex flex-col gap-2 p-0">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-3 w-72 max-w-full" />
        </CardHeader>
        <CardContent className="flex flex-col gap-3 p-0">
          {Array.from({ length: 3 }, (_, index) => (
            <Skeleton key={index} className="h-14 w-full" />
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

function InstitutionStatusSkeleton(): React.ReactElement {
  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative size-52">
        <Skeleton className="absolute inset-5 rounded-full" />
        <div className="bg-card absolute inset-[42px] flex flex-col items-center justify-center gap-2 rounded-full">
          <Skeleton className="h-7 w-14" />
          <Skeleton className="h-3 w-12" />
        </div>
      </div>
      <div className="grid w-full grid-cols-2 gap-3">
        {Array.from({ length: 2 }, (_, index) => (
          <div key={index} className="bg-muted/50 flex items-center gap-3 rounded-lg p-3">
            <Skeleton className="size-2.5 rounded-full" />
            <div className="flex flex-col gap-1">
              <Skeleton className="h-3 w-14" />
              <Skeleton className="h-4 w-8" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
