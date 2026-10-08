"use client";

import { Fragment, type PropsWithChildren, type ReactElement, type ReactNode } from "react";

import { CircleAlertIcon, SearchIcon } from "lucide-react";

import { Button } from "@common/components/ui/button";
import { CommandGroup, CommandItem, CommandSeparator } from "@common/components/ui/command";

import { ContextualSearchAccessList } from "@features/contextual-search/components/contextual-search-access-list";
import { SearchMessage, SearchSkeleton } from "@features/contextual-search/components/contextual-search-feedback";
import { ContextualSearchResultMetadata } from "@features/contextual-search/components/contextual-search-result-metadata";
import { CONTEXTUAL_SEARCH_PRESENTATION } from "@features/contextual-search/config/contextual-search.config";
import type { ContextualSearchAccessSection } from "@features/contextual-search/types/contextual-search-access-section.types";
import type { ContextualSearchGroup } from "@features/contextual-search/types/contextual-search-group.types";
import type { ContextualSearchScope } from "@features/contextual-search/types/contextual-search-scope.types";
import { filterContextualSearchAccessSections } from "@features/contextual-search/utils/contextual-search-access.util";
import { getContextualSearchLabels } from "@features/contextual-search/utils/contextual-search-label.util";
import { getContextualSearchResultHref, getContextualSearchViewAllHref } from "@features/contextual-search/utils/contextual-search-route.util";

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
}: ContextualSearchContentProps): ReactNode {
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
          <Fragment key={group.entityType}>
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
                    <span className="truncate font-medium">{getContextualSearchLabels(group.entityType, item).title}</span>
                    <ContextualSearchResultMetadata
                      item={{
                        ...item,
                        subtitle: getContextualSearchLabels(group.entityType, item).subtitle,
                      }}
                      scope={scope}
                    />
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
          </Fragment>
        );
      })}
    </SearchContentWithAccess>
  );
}

type SearchContentWithAccessProps = PropsWithChildren<{
  onNavigate: (href: string) => void;
  sections: readonly ContextualSearchAccessSection[];
}>;

function SearchContentWithAccess({ children, onNavigate, sections }: SearchContentWithAccessProps): ReactElement {
  return (
    <>
      <ContextualSearchAccessList onNavigate={onNavigate} sections={sections} />
      {sections.length > 0 ? <CommandSeparator /> : null}
      {children}
    </>
  );
}
