import { SidebarTrigger } from "@common/components/ui/sidebar";
import { ContextualSearch } from "@features/contextual-search/components/contextual-search";
import { PLATFORM_NAVIGATION_ITEMS } from "@features/platform-auth/constants/platform-navigation.constants";
import type { ContextualSearchAccessSection } from "@features/contextual-search/types/contextual-search-access-section.types";
import type { ContextualSearchShortcutPlatform } from "@features/contextual-search/types/contextual-search-shortcut-platform.types";

const PLATFORM_CONTEXTUAL_SEARCH_SECTIONS = [{ items: PLATFORM_NAVIGATION_ITEMS }] satisfies readonly ContextualSearchAccessSection[];

type PlatformTopbarProps = {
  shortcutPlatform: ContextualSearchShortcutPlatform;
};

export function PlatformTopbar({ shortcutPlatform }: PlatformTopbarProps): React.ReactElement {
  return (
    <header className="topbar-sticky sticky top-0 z-30 h-16 shrink-0">
      <div className="topbar-surface bg-muted flex h-full w-full items-center justify-between gap-3 rounded-none border border-transparent px-3 transition-[background-color,border-color,box-shadow] duration-300 ease-out motion-reduce:transition-none sm:px-4 md:gap-6 md:rounded-xl">
        <SidebarTrigger
          aria-label="Cambiar estado de la barra lateral"
          className="bg-background hover:bg-accent size-9 shrink-0 rounded-lg shadow-xs"
        />
        <div className="max-w-lg min-w-0 flex-1">
          <ContextualSearch
            accessSections={PLATFORM_CONTEXTUAL_SEARCH_SECTIONS}
            scope="platform"
            mobileVariant="input"
            shortcutPlatform={shortcutPlatform}
            className="rounded-lg bg-transparent p-0"
          />
        </div>
      </div>
    </header>
  );
}
