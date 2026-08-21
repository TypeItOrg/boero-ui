import Link from "next/link";
import { ChevronRightIcon, type LucideIcon } from "lucide-react";

import { cn } from "@common/utils/cn.util";

type NavigationCardProps = {
  className?: string;
  description: string;
  href: string;
  icon: LucideIcon;
  prominent?: boolean;
  title: string;
};

const CARD_SIZE_CLASS = {
  compact: "bg-background gap-3 p-4",
  prominent: "bg-muted/25 min-h-28 gap-4 p-4 sm:p-5",
} as const;

const ICON_CONTAINER_SIZE_CLASS = {
  compact: "bg-muted/40 size-10 rounded-lg",
  prominent: "bg-muted text-muted-foreground w-12 self-stretch rounded-xl",
} as const;

const CARD_CONTENT_CLASS = {
  compact: "items-center gap-3",
  prominent: "items-stretch gap-4",
} as const;

export function NavigationCard({ className, description, href, icon: Icon, prominent = false, title }: NavigationCardProps): React.ReactElement {
  const size = prominent ? "prominent" : "compact";

  return (
    <Link
      href={href}
      className={cn(
        "hover:bg-muted/40 focus-visible:ring-ring group flex min-w-0 items-center rounded-xl border transition-colors focus-visible:ring-2 focus-visible:outline-none focus-visible:ring-inset",
        CARD_SIZE_CLASS[size],
        className,
      )}
    >
      <span className={cn("flex min-w-0 flex-1", CARD_CONTENT_CLASS[size])}>
        <span
          className={cn("bg-background text-primary flex shrink-0 items-center justify-center border shadow-xs", ICON_CONTAINER_SIZE_CLASS[size])}
        >
          <Icon aria-hidden="true" className={prominent ? "size-6" : "size-5"} />
        </span>
        <span className="min-w-0 flex-1">
          <span className={cn("block font-semibold", prominent && "text-base tracking-tight sm:text-lg")}>{title}</span>
          <span className="text-muted-foreground mt-0.5 block text-sm leading-relaxed">{description}</span>
        </span>
      </span>
      <ChevronRightIcon aria-hidden="true" className="text-muted-foreground size-4 shrink-0 transition-transform group-hover:translate-x-0.5" />
    </Link>
  );
}
