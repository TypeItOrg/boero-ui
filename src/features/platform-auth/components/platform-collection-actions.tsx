import { cn } from "@common/utils/cn.util";

export function PlatformCollectionActions({ children, className }: { children?: React.ReactNode; className?: string }): React.ReactElement | null {
  if (!children) return null;

  return <div className={cn("flex shrink-0 flex-col gap-2 sm:flex-row sm:justify-end [&>*]:w-full sm:[&>*]:w-auto", className)}>{children}</div>;
}
