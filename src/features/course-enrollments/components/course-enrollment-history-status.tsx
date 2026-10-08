import type { ReactElement } from "react";

import { Badge } from "@common/components/ui/badge";
import { DETAIL_LABEL_CLASS_NAME } from "@common/constants/detail-label.constants";

export function HistoryStatus({ previous, current }: { previous: string | null; current: string | null }): ReactElement {
  if (!current) {
    return <span className="text-muted-foreground">Sin registro</span>;
  }

  if (!previous) {
    return (
      <div className="space-y-1 py-1">
        <p className={DETAIL_LABEL_CLASS_NAME}>Estado inicial</p>
        <Badge variant="outline">{current}</Badge>
      </div>
    );
  }

  if (previous === current) {
    return (
      <div className="space-y-1 py-1">
        <p className="text-muted-foreground text-xs">Sin cambios</p>
        <Badge variant="outline">{current}</Badge>
      </div>
    );
  }

  return (
    <dl className="space-y-1 py-1 text-sm">
      <div className="flex gap-2">
        <dt className={DETAIL_LABEL_CLASS_NAME}>Antes:</dt>
        <dd>{previous}</dd>
      </div>
      <div className="flex gap-2">
        <dt className={DETAIL_LABEL_CLASS_NAME}>Después:</dt>
        <dd className="font-medium">{current}</dd>
      </div>
    </dl>
  );
}
