import type { ReactElement, ReactNode } from "react";

import { Button } from "@common/components/ui/button";
import { EmptyContent } from "@common/components/ui/empty";

type DataTableEmptyStateActionsProps = {
  createAction?: ReactNode;
  hasFilters: boolean;
  hasItemsOnOtherPages: boolean;
  onFirstPage?: () => void;
};

export function DataTableEmptyStateActions({
  createAction,
  hasFilters,
  hasItemsOnOtherPages,
  onFirstPage,
}: DataTableEmptyStateActionsProps): ReactElement | null {
  if (hasItemsOnOtherPages) {
    if (!onFirstPage) {
      return null;
    }

    return (
      <EmptyContent className="w-auto max-w-full">
        <Button type="button" variant="outline" size="sm" onClick={onFirstPage}>
          Volver a la primera página
        </Button>
      </EmptyContent>
    );
  }

  if (hasFilters || !createAction) {
    return null;
  }

  return <EmptyContent className="w-auto max-w-full">{createAction}</EmptyContent>;
}
