import { NavigationCardSkeleton } from "@common/components/navigation/navigation-card-skeleton";
import { Skeleton } from "@common/components/ui/skeleton";

export function InstitutionalHomeSkeleton(): React.ReactElement {
  return (
    <main className="flex min-h-full flex-1 flex-col gap-4" aria-label="Cargando portal institucional" role="status">
      <header className="bg-muted/60 relative flex h-56 min-w-0 items-center overflow-hidden shadow-sm sm:h-64">
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-linear-to-r from-black/80 via-black/60 to-black/25 sm:from-black/85 sm:via-black/60 sm:via-[65%] sm:to-black/15 sm:to-[90%] 2xl:from-black/85 2xl:via-black/50 2xl:via-[50%] 2xl:to-black/5 2xl:to-[100%] dark:bg-black/20"
        />
        <div aria-hidden="true" className="absolute inset-0 bg-linear-to-t from-black/20 via-transparent to-transparent dark:from-black/35" />
        <div className="relative flex max-w-3xl min-w-0 items-center gap-4 p-5 text-white sm:p-6 lg:p-8">
          <Skeleton className="h-32 w-24 shrink-0 rounded-lg bg-white/15 ring-1 ring-white/10" />
          <div className="flex h-32 min-w-0 flex-col justify-center gap-4 py-1 sm:h-36 sm:py-2">
            <div>
              <Skeleton className="h-8 w-56 max-w-full bg-white/25 sm:h-9 sm:w-72" />
              <Skeleton className="mt-2 h-4 w-44 max-w-full bg-white/20 sm:h-5 sm:w-56" />
            </div>
            <div className="flex flex-col gap-1.5 sm:flex-row sm:items-center sm:gap-4">
              <Skeleton className="h-4 w-32 bg-white/20 sm:w-36" />
              <div className="hidden h-3.5 w-px bg-white/30 sm:block" />
              <Skeleton className="h-6 w-24 rounded-full bg-white/20 sm:w-28" />
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-col gap-4 px-3 pb-3 md:px-4 md:pb-4">
        {/* Gestión institucional skeleton */}
        <section className="bg-background flex flex-col gap-4 rounded-xl border p-4 shadow-xs sm:p-5">
          <div className="flex items-stretch justify-between gap-4">
            <div className="flex min-w-0 flex-1 flex-col gap-1.5">
              <Skeleton className="h-6 w-44" />
              <Skeleton className="h-4 w-64 max-w-full" />
            </div>
            <Skeleton className="size-11 shrink-0 rounded-xl" />
          </div>
          <div className="grid gap-4 lg:grid-cols-[minmax(200px,0.7fr)_minmax(0,2fr)]">
            <Skeleton className="h-44 rounded-lg border sm:h-52 lg:h-92" />
            <div className="grid gap-4">
              <NavigationCardSkeleton prominent />
              <NavigationCardSkeleton prominent />
            </div>
          </div>
        </section>

        {/* Gestión académica skeleton */}
        <section className="bg-background flex flex-col gap-4 rounded-xl border p-4 shadow-xs sm:p-5">
          <div className="flex items-stretch justify-between gap-4">
            <div className="flex min-w-0 flex-1 flex-col gap-1.5">
              <Skeleton className="h-6 w-40" />
              <Skeleton className="h-4 w-72 max-w-full" />
            </div>
            <Skeleton className="size-11 shrink-0 rounded-xl" />
          </div>
          <div className="grid gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(200px,0.7fr)]">
            <div className="grid gap-4 sm:grid-cols-2 lg:order-1">
              <NavigationCardSkeleton prominent />
              <NavigationCardSkeleton prominent />
              <NavigationCardSkeleton prominent />
              <NavigationCardSkeleton prominent />
              <NavigationCardSkeleton prominent className="sm:col-span-2" />
            </div>
            <Skeleton className="h-44 rounded-lg border sm:h-52 lg:order-2 lg:h-92" />
          </div>
        </section>
      </div>
    </main>
  );
}
