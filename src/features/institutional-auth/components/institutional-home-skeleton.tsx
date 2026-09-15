import { NavigationCardSkeleton } from "@common/components/navigation/navigation-card-skeleton";
import { Skeleton } from "@common/components/ui/skeleton";

export function InstitutionalHomeSkeleton(): React.ReactElement {
  return (
    <main className="flex min-h-full flex-1 flex-col gap-4" aria-label="Cargando portal institucional" role="status">
      <header className="bg-muted/60 @container/home-hero relative flex h-56 min-w-0 items-center overflow-hidden shadow-sm @2xl/home-hero:h-64">
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-linear-to-r from-black/80 via-black/60 to-black/25 sm:from-black/85 sm:via-black/60 sm:via-[65%] sm:to-black/15 sm:to-[90%] 2xl:from-black/85 2xl:via-black/50 2xl:via-[50%] 2xl:to-black/5 2xl:to-[100%] dark:bg-black/20"
        />
        <div aria-hidden="true" className="absolute inset-0 bg-linear-to-t from-black/20 via-transparent to-transparent dark:from-black/35" />
        <div className="relative flex max-w-3xl min-w-0 items-center gap-4 p-5 text-white @2xl/home-hero:p-6 @4xl/home-hero:p-8">
          <Skeleton className="h-28 w-20 shrink-0 rounded-lg bg-white/15 ring-1 ring-white/10 @2xl/home-hero:h-32 @2xl/home-hero:w-24" />
          <div className="flex h-28 min-w-0 flex-col justify-center gap-3 py-1 @2xl/home-hero:h-32 @2xl/home-hero:gap-4 @4xl/home-hero:h-36 @4xl/home-hero:py-2">
            <div>
              <Skeleton className="h-8 w-48 max-w-full bg-white/25 @2xl/home-hero:w-60 @4xl/home-hero:h-9 @4xl/home-hero:w-72" />
              <Skeleton className="mt-2 h-4 w-40 max-w-full bg-white/20 @2xl/home-hero:h-5 @2xl/home-hero:w-56" />
            </div>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-2 @2xl/home-hero:gap-x-4">
              <Skeleton className="h-4 w-32 bg-white/20 @2xl/home-hero:w-36" />
              <div className="hidden h-3.5 w-px bg-white/30 @2xl/home-hero:block" />
              <Skeleton className="h-6 w-24 rounded-full bg-white/20 @2xl/home-hero:w-28" />
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-col gap-4 px-3 pb-3 md:px-4 md:pb-4">
        {/* Gestión institucional skeleton */}
        <section className="bg-background @container/home-section flex flex-col gap-4 rounded-xl border p-4 shadow-xs sm:p-5">
          <div className="flex items-stretch justify-between gap-4">
            <div className="flex min-w-0 flex-1 flex-col gap-1.5">
              <Skeleton className="h-6 w-44" />
              <Skeleton className="h-4 w-64 max-w-full" />
            </div>
            <Skeleton className="size-11 shrink-0 rounded-xl" />
          </div>
          <div className="grid gap-4 @5xl/home-section:grid-cols-[minmax(200px,0.7fr)_minmax(0,2fr)]">
            <Skeleton className="h-44 rounded-lg border sm:h-52 @5xl/home-section:h-92" />
            <div className="grid gap-4">
              <NavigationCardSkeleton prominent />
              <NavigationCardSkeleton prominent />
            </div>
          </div>
        </section>

        {/* Gestión académica skeleton */}
        <section className="bg-background @container/home-section flex flex-col gap-4 rounded-xl border p-4 shadow-xs sm:p-5">
          <div className="flex items-stretch justify-between gap-4">
            <div className="flex min-w-0 flex-1 flex-col gap-1.5">
              <Skeleton className="h-6 w-40" />
              <Skeleton className="h-4 w-72 max-w-full" />
            </div>
            <Skeleton className="size-11 shrink-0 rounded-xl" />
          </div>
          <div className="grid gap-4 @5xl/home-section:grid-cols-[minmax(0,2fr)_minmax(200px,0.7fr)]">
            <div className="@container/home-content min-w-0 @5xl/home-section:order-1">
              <div className="grid gap-4 @2xl/home-content:grid-cols-2">
                <NavigationCardSkeleton prominent />
                <NavigationCardSkeleton prominent />
                <NavigationCardSkeleton prominent />
                <NavigationCardSkeleton prominent />
                <NavigationCardSkeleton prominent className="@2xl/home-content:col-span-2" />
              </div>
            </div>
            <Skeleton className="h-44 rounded-lg border sm:h-52 @5xl/home-section:order-2 @5xl/home-section:h-92" />
          </div>
        </section>
      </div>
    </main>
  );
}
