"use client";

import { Fragment, type ReactElement } from "react";

import { CommandGroup, CommandItem, CommandSeparator } from "@common/components/ui/command";

import type { ContextualSearchAccessSection } from "@features/contextual-search/types/contextual-search-access-section.types";

type ContextualSearchAccessListProps = {
  onNavigate: (href: string) => void;
  sections: readonly ContextualSearchAccessSection[];
};

export function ContextualSearchAccessList({ onNavigate, sections }: ContextualSearchAccessListProps): ReactElement | null {
  if (sections.length === 0) {
    return null;
  }

  return (
    <>
      {sections.map((section, sectionIndex) => (
        <Fragment key={`${section.label ?? "Accesos"}-${sectionIndex}`}>
          {sectionIndex > 0 ? <CommandSeparator /> : null}
          <CommandGroup heading={section.label ?? "Accesos"} className="px-3 pb-2.5 sm:px-4 **:[[cmdk-group-heading]]:px-0">
            {section.items.map((item) => {
              const Icon = item.icon;

              return (
                <CommandItem key={item.url} value={`access-${item.url}`} className="gap-3 px-2 py-2" onSelect={() => onNavigate(item.url)}>
                  <span className="bg-muted text-muted-foreground flex size-8 shrink-0 items-center justify-center rounded-lg">
                    <Icon className="size-4" />
                  </span>
                  <span className="truncate font-medium">{item.title}</span>
                </CommandItem>
              );
            })}
          </CommandGroup>
        </Fragment>
      ))}
    </>
  );
}
