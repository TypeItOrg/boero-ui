"use client";

import * as React from "react";
import { CircleAlertIcon, SearchIcon, type LucideIcon } from "lucide-react";

import { Badge } from "@common/components/ui/badge";
import { Button } from "@common/components/ui/button";
import { CommandGroup, CommandItem, CommandSeparator } from "@common/components/ui/command";
import { Skeleton } from "@common/components/ui/skeleton";
import { cn } from "@common/utils/cn.util";
import { ContextualSearchAccessList } from "@features/contextual-search/components/contextual-search-access-list";
import {
  CONTEXTUAL_SEARCH_CATEGORY_LABELS,
  CONTEXTUAL_SEARCH_PRESENTATION,
  CONTEXTUAL_SEARCH_STATUS_LABELS,
  hasPositiveContextualSearchStatus,
} from "@features/contextual-search/config/contextual-search.config";
import type { ContextualSearchAccessSection } from "@features/contextual-search/types/contextual-search-access-section.types";
import type { ContextualSearchGroup } from "@features/contextual-search/types/contextual-search-group.types";
import type { ContextualSearchResult } from "@features/contextual-search/types/contextual-search-result.types";
import type { ContextualSearchScope } from "@features/contextual-search/types/contextual-search-scope.types";
import { filterContextualSearchAccessSections } from "@features/contextual-search/utils/contextual-search-access.util";
import {
  getContextualSearchResultHref,
  getContextualSearchViewAllHref,
} from "@features/contextual-search/utils/contextual-search-route.util";

type ContextualSearchContentProps = {
  accessSections: readonly ContextualSearchAccessSection[];
  canSearch: boolean;
  groups: ContextualSearchGroup[];
  isError: boolean;
  inputSearch: string;
  isLoading: boolean;
  onNavigate: (href: string) => void;
  onRetry: () => void;
  scope: ContextualSearchScope;
  search: string;
};

type SearchMessageProps = React.PropsWithChildren<{
  action?: React.ReactNode;
  compact?: boolean;
  icon: LucideIcon;
  role?: "alert" | "status";
  title?: string;
}>;

const SEARCH_SKELETON_ROWS = [0] as const;

export function ContextualSearchContent({
  accessSections,
  canSearch,
  groups,
  isError,
  inputSearch,
  isLoading,
  onNavigate,
  onRetry,
  scope,
  search,
}: ContextualSearchContentProps): React.ReactNode {
  const matchingAccessSections = filterContextualSearchAccessSections(accessSections, inputSearch);

  if (!canSearch) {
    if (matchingAccessSections.length > 0) {
      return <ContextualSearchAccessList onNavigate={onNavigate} sections={matchingAccessSections} />;
    }

    return (
      <SearchMessage icon={SearchIcon} title={inputSearch ? "Seguí escribiendo" : "Realizá una búsqueda"}>
        Escribí al menos 2 caracteres para buscar.
      </SearchMessage>
    );
  }
  if (isLoading) {
    return (
      <SearchContentWithAccess onNavigate={onNavigate} sections={matchingAccessSections}>
        <SearchSkeleton />
      </SearchContentWithAccess>
    );
  }
  if (isError) {
    return (
      <SearchContentWithAccess onNavigate={onNavigate} sections={matchingAccessSections}>
        <SearchMessage
          compact={matchingAccessSections.length > 0}
          icon={CircleAlertIcon}
          role="alert"
          title="No pudimos completar la búsqueda"
          action={
            <Button type="button" onClick={onRetry}>
              Reintentar
            </Button>
          }
        >
          Intentá nuevamente en unos instantes.
        </SearchMessage>
      </SearchContentWithAccess>
    );
  }
  if (groups.length === 0) {
    if (matchingAccessSections.length > 0) {
      return <ContextualSearchAccessList onNavigate={onNavigate} sections={matchingAccessSections} />;
    }

    return (
      <SearchMessage icon={SearchIcon} title="No encontramos coincidencias">
        Probá con otros términos.
      </SearchMessage>
    );
  }

  return (
    <SearchContentWithAccess onNavigate={onNavigate} sections={matchingAccessSections}>
      {groups.map((group, index) => {
        const presentation = CONTEXTUAL_SEARCH_PRESENTATION[group.entityType];
        const Icon = presentation.icon;
        const viewAllHref = group.hasMore ? getContextualSearchViewAllHref(scope, group.entityType, search) : null;

        return (
          <React.Fragment key={group.entityType}>
            {index > 0 ? <CommandSeparator /> : null}
            <CommandGroup heading={presentation.plural} className="px-3 pb-2.5 sm:px-4 **:[[cmdk-group-heading]]:px-0">
              {group.items.map((item) => (
                <CommandItem
                  key={item.id}
                  value={`${group.entityType}-${item.id}`}
                  className="items-stretch gap-3 px-2 py-1.5"
                  onSelect={() => onNavigate(getContextualSearchResultHref(scope, group.entityType, item))}
                >
                  <span className="bg-background text-muted-foreground flex w-8 shrink-0 items-center justify-center rounded-lg">
                    <Icon className="size-4" />
                  </span>
                  <span className="grid min-w-0 flex-1 grid-rows-2 gap-0.5">
                    <span className="truncate font-medium">{item.title}</span>
                    <ResultMetadata item={item} scope={scope} />
                  </span>
                </CommandItem>
              ))}
              {viewAllHref ? (
                <CommandItem
                  value={`all-${group.entityType}`}
                  className="text-primary justify-center py-2 text-xs font-medium"
                  onSelect={() => onNavigate(viewAllHref)}
                >
                  Ver todos los resultados en {presentation.plural.toLowerCase()}
                </CommandItem>
              ) : null}
            </CommandGroup>
          </React.Fragment>
        );
      })}
    </SearchContentWithAccess>
  );
}

type SearchContentWithAccessProps = React.PropsWithChildren<{
  onNavigate: (href: string) => void;
  sections: readonly ContextualSearchAccessSection[];
}>;

function SearchContentWithAccess({ children, onNavigate, sections }: SearchContentWithAccessProps): React.ReactElement {
  return (
    <>
      <ContextualSearchAccessList onNavigate={onNavigate} sections={sections} />
      {sections.length > 0 ? <CommandSeparator /> : null}
      {children}
    </>
  );
}

function ResultMetadata({
  item,
  scope,
}: {
  item: ContextualSearchResult;
  scope: ContextualSearchScope;
}): React.ReactElement {
  const metadata = [item.subtitle, scope === "platform" ? item.institutionName : null].filter(Boolean).join(" · ");
  const statusLabel = item.status ? (CONTEXTUAL_SEARCH_STATUS_LABELS[item.status] ?? item.status) : null;
  const categoryLabel = item.category ? (CONTEXTUAL_SEARCH_CATEGORY_LABELS[item.category] ?? item.category) : null;

  return (
    <span className="flex min-w-0 items-center gap-1.5 overflow-hidden">
      {metadata ? <span className="text-muted-foreground truncate text-xs">{metadata}</span> : null}
      <span className="flex shrink-0 items-center gap-1">
        {statusLabel ? (
          <Badge
            variant={hasPositiveContextualSearchStatus(item.status) ? "success" : "secondary"}
            className="h-4 px-1.5 text-[10px]"
          >
            {statusLabel}
          </Badge>
        ) : null}
        {categoryLabel ? (
          <Badge variant="secondary" className="h-4 px-1.5 text-[10px]">
            {categoryLabel}
          </Badge>
        ) : null}
        {item.institutionActive === false ? (
          <Badge variant="secondary" className="h-4 px-1.5 text-[10px]">
            Institución inactiva
          </Badge>
        ) : null}
      </span>
    </span>
  );
}

function SearchMessage({
  action,
  compact = false,
  icon: Icon,
  role = "status",
  title,
  children,
}: SearchMessageProps): React.ReactElement {
  return (
    <div
      role={role}
      aria-live={role === "alert" ? "assertive" : "polite"}
      className={cn(
        "text-muted-foreground flex flex-col items-center gap-2 px-5 text-center text-sm",
        compact ? "py-4" : "py-9 max-sm:min-h-[calc(min(78dvh,42rem)-3.5rem)] max-sm:justify-center",
      )}
    >
      <span className="bg-muted flex size-9 items-center justify-center rounded-full">
        <Icon className="size-4" />
      </span>
      <div className="flex flex-col gap-1">
        {title ? <p className="text-foreground font-medium">{title}</p> : null}
        <span>{children}</span>
        {action ? <div className="pt-1.5">{action}</div> : null}
      </div>
    </div>
  );
}

function SearchSkeleton(): React.ReactElement {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Buscando resultados"
      className="flex flex-col gap-2 px-3 pt-2.5 pb-2.5 sm:px-4"
    >
      <Skeleton className="bg-muted-foreground/15 h-3 w-16" />
      {SEARCH_SKELETON_ROWS.map((item) => (
        <div key={item} className="bg-muted flex h-13.5 items-stretch gap-3 rounded-lg px-2 py-1.5">
          <Skeleton className="bg-muted-foreground/10 h-auto min-h-8 w-8 shrink-0 rounded-lg" />
          <Skeleton className="bg-muted-foreground/10 size-full" />
        </div>
      ))}
    </div>
  );
}
