import { Kbd } from "@common/components/ui/kbd";
import type { ContextualSearchShortcutPlatform } from "@features/contextual-search/types/contextual-search-shortcut-platform.types";

type ContextualSearchShortcutProps = {
  platform: ContextualSearchShortcutPlatform;
};

export function ContextualSearchShortcut({ platform }: ContextualSearchShortcutProps): React.ReactElement {
  return (
    <Kbd className="contextual-search-shortcut absolute top-1/2 right-2 hidden -translate-y-1/2 sm:inline-flex">
      {platform === "mac" ? "\u2318 K" : "Ctrl K"}
    </Kbd>
  );
}
