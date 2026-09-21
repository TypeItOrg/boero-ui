import { Skeleton } from "@common/components/ui/skeleton";

export function MySubjectsSkeleton(): React.ReactElement {
  return <Skeleton className="min-h-56 w-full flex-1 rounded-xl" aria-hidden="true" />;
}
