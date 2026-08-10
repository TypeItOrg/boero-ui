import { SidebarTrigger } from "@common/components/ui/sidebar";
import { ContextualSearch } from "@features/contextual-search/components/contextual-search";
import type { ContextualSearchAccessSection } from "@features/contextual-search/types/contextual-search-access-section.types";
import type { ContextualSearchShortcutPlatform } from "@features/contextual-search/types/contextual-search-shortcut-platform.types";

type InstitutionalTopbarProps = {
  accessSections: readonly ContextualSearchAccessSection[];
  institutionId: string;
  institutionName?: string;
  shortcutPlatform: ContextualSearchShortcutPlatform;
};

export function InstitutionalTopbar({
  accessSections,
  institutionId,
  institutionName,
  shortcutPlatform,
}: InstitutionalTopbarProps): React.ReactElement {
  return (
    <header className="topbar-sticky sticky top-0 z-10 h-16 shrink-0">
      <div className="topbar-surface bg-muted flex h-full w-full items-center justify-between gap-3 rounded-none border border-transparent px-3 transition-[background-color,border-color,box-shadow] duration-300 ease-out motion-reduce:transition-none sm:px-4 md:rounded-xl">
        <SidebarTrigger
          aria-label="Cambiar estado de la barra lateral"
          className="bg-background hover:bg-accent size-9 shrink-0 rounded-lg shadow-xs"
        />
        <div className="hidden min-w-0 flex-1 md:block">
          <span className="block truncate text-sm font-semibold" title={institutionName ?? "Institución"}>
            {institutionName ?? "Institución"}
          </span>
          <span className="text-muted-foreground block text-xs">Portal Institucional</span>
        </div>
        <div className="max-w-lg min-w-0 flex-1">
          <ContextualSearch
            accessSections={accessSections}
            scope="institutional"
            institutionId={institutionId}
            mobileVariant="input"
            shortcutPlatform={shortcutPlatform}
            className="rounded-lg bg-transparent p-0"
          />
        </div>
      </div>
    </header>
  );
}
