import { Skeleton } from "@common/components/ui/skeleton";
import { cn } from "@common/utils/cn.util";

type NavigationCardSkeletonProps = {
  className?: string;
  prominent?: boolean;
};

export function NavigationCardSkeleton({ className, prominent = false }: NavigationCardSkeletonProps): React.ReactElement {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "flex min-w-0 items-center rounded-xl border",
        prominent ? "bg-muted/25 min-h-28 gap-4 p-4 sm:p-5" : "bg-background gap-3 p-4",
        className,
      )}
    >
      <div className={cn("flex min-w-0 flex-1", prominent ? "items-stretch gap-4" : "items-center gap-3")}>
        <Skeleton className={cn("shrink-0", prominent ? "w-12 self-stretch rounded-xl" : "size-10 rounded-lg")} />
        <div className="flex min-w-0 flex-1 flex-col justify-center gap-2">
          <Skeleton className={cn("h-5 w-36 sm:w-44", prominent && "h-6 sm:w-48")} />
          <Skeleton className="h-4 w-5/6 max-w-sm" />
        </div>
      </div>
      <Skeleton className="size-4 shrink-0 rounded-sm" />
    </div>
  );
}
