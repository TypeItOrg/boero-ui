"use client";

import { SlidersHorizontalIcon } from "lucide-react";

import { Badge } from "@common/components/ui/badge";
import { Button } from "@common/components/ui/button";
import { SheetTrigger } from "@common/components/ui/sheet";

type DataTableAdvancedFiltersTriggerProps = {
  count: number;
  label?: string;
  labelledBy?: string;
};

export function DataTableAdvancedFiltersTrigger({ count, label, labelledBy }: DataTableAdvancedFiltersTriggerProps): React.ReactElement {
  return (
    <SheetTrigger asChild>
      <Button type="button" variant="outline" size="lg" className="border-input" aria-labelledby={labelledBy}>
        <SlidersHorizontalIcon />
        {label}
        {count > 0 ? (
          <Badge data-testid="advanced-filters-badge" variant="secondary" aria-live="polite">
            {count}
          </Badge>
        ) : null}
      </Button>
    </SheetTrigger>
  );
}
