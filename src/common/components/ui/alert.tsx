import type { ComponentProps } from "react";

import { cva, type VariantProps } from "class-variance-authority";
import { CircleAlertIcon } from "lucide-react";

import { cn } from "@common/utils/cn.util";

const alertVariants = cva(
  "group/alert relative grid w-full gap-0.5 rounded-lg border px-2.5 py-2 text-left text-sm has-data-[slot=alert-action]:relative has-data-[slot=alert-action]:pr-18 has-[>svg]:grid-cols-[auto_1fr] has-[>svg]:gap-x-2 *:[svg]:row-span-2 *:[svg]:translate-y-0.5 *:[svg]:text-current *:[svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: "bg-card text-card-foreground",
        success:
          "border-emerald-500/20 bg-card text-emerald-700 dark:border-emerald-500/30 dark:text-emerald-300 *:data-[slot=alert-description]:text-emerald-700/90 dark:*:data-[slot=alert-description]:text-emerald-300/90",
        destructive: "bg-card text-destructive *:data-[slot=alert-description]:text-destructive/90 *:[svg]:text-current",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

function Alert({ className, variant, children, ...props }: ComponentProps<"div"> & VariantProps<typeof alertVariants>) {
  return (
    <div data-slot="alert" role="alert" className={cn(alertVariants({ variant }), className)} {...props}>
      {variant === "destructive" ? (
        // Preserve explicit icons, including those rendered conditionally or through a fragment.
        <CircleAlertIcon
          data-slot="alert-default-icon"
          aria-hidden="true"
          className="group-has-[>svg:not([data-slot=alert-default-icon])]/alert:hidden"
        />
      ) : null}
      {children}
    </div>
  );
}

function AlertTitle({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-title"
      className={cn("[&_a]:hover:text-foreground font-medium group-has-[>svg]/alert:col-start-2 [&_a]:underline [&_a]:underline-offset-3", className)}
      {...props}
    />
  );
}

function AlertDescription({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-description"
      className={cn(
        "text-muted-foreground [&_a]:hover:text-foreground text-sm text-balance md:text-pretty [&_a]:underline [&_a]:underline-offset-3 [&_p:not(:last-child)]:mb-4",
        className,
      )}
      {...props}
    />
  );
}

function AlertAction({ className, ...props }: ComponentProps<"div">) {
  return <div data-slot="alert-action" className={cn("absolute top-2 right-2", className)} {...props} />;
}

export { Alert, AlertAction, AlertDescription, AlertTitle };
