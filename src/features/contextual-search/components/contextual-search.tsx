"use client";

import { useQuery } from "@tanstack/react-query";
import { SearchIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import * as React from "react";

import { Command, CommandDialog, CommandInput, CommandList } from "@common/components/ui/command";
import { useDebouncedValue } from "@common/hooks/use-debounced-value";
import { cn } from "@common/utils/cn.util";
import { ContextualSearchContent } from "@features/contextual-search/components/contextual-search-content";
import { ContextualSearchShortcut } from "@features/contextual-search/components/contextual-search-shortcut";
import { fetchContextualSearch } from "@features/contextual-search/services/fetch-contextual-search.service";
import type { ContextualSearchAccessSection } from "@features/contextual-search/types/contextual-search-access-section.types";
import type { ContextualSearchScope } from "@features/contextual-search/types/contextual-search-scope.types";
import type { ContextualSearchShortcutPlatform } from "@features/contextual-search/types/contextual-search-shortcut-platform.types";
import { omitContextualSearchAccessItems } from "@features/contextual-search/utils/contextual-search-access.util";

type ContextualSearchScopeProps =
  | { scope: "platform"; institutionId?: never; className?: string }
  | { scope: "institutional"; institutionId: string; className?: string };

type ContextualSearchProps = ContextualSearchScopeProps & {
  accessSections: readonly ContextualSearchAccessSection[];
  shortcutPlatform?: ContextualSearchShortcutPlatform;
};

const CONTEXTUAL_SEARCH_COPY: Record<ContextualSearchScope, { label: string; placeholder: string }> = {
  platform: {
    label: "Buscar en la plataforma",
    placeholder: "Buscar en la plataforma...",
  },
  institutional: {
    label: "Buscar en la institución",
    placeholder: "Buscar en la institución...",
  },
};

const CONTEXTUAL_SEARCH_EXCLUDED_ACCESS_URLS: Record<ContextualSearchScope, readonly string[]> = {
  platform: ["/admin"],
  institutional: ["/", "/profile"],
};

export function ContextualSearch(props: ContextualSearchProps): React.ReactElement {
  const { accessSections, scope, className, shortcutPlatform = "windows" } = props;
  const router = useRouter();
  const [value, setValue] = React.useState("");
  const [open, setOpen] = React.useState(false);
  const copy = CONTEXTUAL_SEARCH_COPY[scope];
  const debouncedSearch = useDebouncedValue(value.trim(), 300);
  const canSearch = debouncedSearch.length >= 2;
  const visibleAccessSections = omitContextualSearchAccessItems(
    accessSections,
    CONTEXTUAL_SEARCH_EXCLUDED_ACCESS_URLS[scope],
  );
  const query = useQuery({
    queryKey: [
      "contextual-search",
      scope,
      props.scope === "institutional" ? props.institutionId : null,
      debouncedSearch,
    ],
    queryFn: ({ signal }) =>
      fetchContextualSearch(
        props.scope === "institutional"
          ? { scope: "institutional", institutionId: props.institutionId, search: debouncedSearch }
          : { scope: "platform", search: debouncedSearch },
        signal,
      ),
    enabled: open && canSearch,
    staleTime: 30_000,
    retry: false,
  });

  React.useEffect(() => {
    function handleShortcut(event: KeyboardEvent): void {
      if (!event.defaultPrevented && (event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen(true);
      }
    }
    window.addEventListener("keydown", handleShortcut);
    return () => window.removeEventListener("keydown", handleShortcut);
  }, []);

  function handleOpenChange(nextOpen: boolean): void {
    setOpen(nextOpen);
  }

  function handleCloseAutoFocus(event: Event): void {
    event.preventDefault();
    setValue("");
  }

  function navigate(href: string): void {
    router.push(href);
    setTimeout(() => {
      handleOpenChange(false);
    }, 150);
  }

  return (
    <div className={cn("w-auto md:w-full", className)}>
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-label={copy.label}
        className="topbar-search-input bg-background text-muted-foreground hover:bg-accent focus-visible:ring-ring relative flex size-9 shrink-0 items-center justify-center rounded-lg p-0 text-left text-sm shadow-xs transition-[background-color,border-color,box-shadow] duration-300 ease-out outline-none focus-visible:ring-2 focus-visible:ring-offset-2 motion-reduce:transition-none md:h-9 md:w-full md:justify-start md:px-3 md:pr-16 md:pl-9"
        onClick={() => setOpen(true)}
      >
        <SearchIcon className="pointer-events-none size-4 md:absolute md:left-3" />
        <span className="hidden truncate md:block">{copy.placeholder}</span>
        <span className="hidden md:contents">
          <ContextualSearchShortcut platform={shortcutPlatform} />
        </span>
      </button>

      <CommandDialog
        open={open}
        onOpenChange={handleOpenChange}
        onCloseAutoFocus={handleCloseAutoFocus}
        title={copy.label}
        description={`${copy.label}. Escribí al menos 2 caracteres para buscar.`}
        showCloseButton={false}
        className="max-sm:data-open:slide-in-from-bottom max-sm:data-closed:slide-out-to-bottom max-sm:data-closed:zoom-out-100 top-auto right-0 bottom-0 left-0 h-[min(78dvh,42rem)] max-h-[calc(100dvh-1rem)] max-w-none translate-x-0 translate-y-0 gap-0 rounded-none! p-0 duration-200 ease-out max-sm:duration-300 sm:top-1/2 sm:right-auto sm:bottom-auto sm:left-1/2 sm:h-auto sm:max-h-[min(42rem,calc(100dvh-2rem))] sm:max-w-2xl sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-xl!"
      >
        <Command label={copy.label} shouldFilter={false} className="max-h-full rounded-none! p-0 sm:rounded-xl!">
          <CommandInput
            variant="palette"
            aria-label={copy.label}
            autoFocus
            autoComplete="off"
            placeholder={copy.placeholder}
            shortcut="Esc"
            value={value}
            onValueChange={setValue}
          />
          <CommandList className="max-h-[min(34rem,calc(100dvh-6rem))] max-sm:max-h-none max-sm:min-h-0 max-sm:flex-1">
            <ContextualSearchContent
              accessSections={visibleAccessSections}
              canSearch={canSearch}
              search={debouncedSearch}
              inputSearch={value.trim()}
              isLoading={query.isLoading}
              isError={query.isError}
              groups={query.data?.groups ?? []}
              scope={scope}
              onRetry={() => void query.refetch()}
              onNavigate={navigate}
            />
          </CommandList>
        </Command>
      </CommandDialog>
    </div>
  );
}
