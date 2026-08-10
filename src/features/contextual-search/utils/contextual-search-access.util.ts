import type { ContextualSearchAccessSection } from "@features/contextual-search/types/contextual-search-access-section.types";

export function filterContextualSearchAccessSections(
  sections: readonly ContextualSearchAccessSection[],
  search: string,
): ContextualSearchAccessSection[] {
  const normalizedSearch = normalizeContextualSearchValue(search);

  return sections
    .map((section) => ({
      ...section,
      items: section.items.filter((item) => normalizeContextualSearchValue(item.title).includes(normalizedSearch)),
    }))
    .filter((section) => section.items.length > 0);
}

export function omitContextualSearchAccessItems(
  sections: readonly ContextualSearchAccessSection[],
  excludedUrls: readonly string[],
): ContextualSearchAccessSection[] {
  const excludedUrlSet = new Set(excludedUrls);

  return sections
    .map((section) => ({
      ...section,
      items: section.items.filter((item) => !excludedUrlSet.has(item.url)),
    }))
    .filter((section) => section.items.length > 0);
}

function normalizeContextualSearchValue(value: string): string {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase();
}
