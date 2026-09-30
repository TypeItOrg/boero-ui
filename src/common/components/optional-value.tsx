import type { ReactNode } from "react";

type OptionalValueProps = {
  value: ReactNode;
  fallback: string;
};

export function OptionalValue({ value, fallback }: OptionalValueProps): ReactNode {
  if (value === null || value === undefined || (typeof value === "string" && !value.trim())) {
    return <span className="text-muted-foreground font-normal italic">{fallback}</span>;
  }

  return value;
}
