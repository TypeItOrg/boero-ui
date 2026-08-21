import type { AcademicContextualSearchEntity } from "@features/contextual-search/types/academic-contextual-search-entity.types";
import type { ContextualSearchEntity } from "@features/contextual-search/types/contextual-search-entity.types";
import type { ContextualSearchResult } from "@features/contextual-search/types/contextual-search-result.types";
import { CONTEXTUAL_SEARCH_SCOPE, type ContextualSearchScope } from "@features/contextual-search/types/contextual-search-scope.types";
import { parseAcademicYearFilter } from "@features/academic/utils/academic-year.util";

const ACADEMIC_RESOURCE_BY_ENTITY: Record<AcademicContextualSearchEntity, string> = {
  "academic-year": "academic-years",
  "training-path": "training-paths",
  "study-plan": "study-plans",
  "academic-space": "academic-spaces",
  instrument: "instruments",
};

export function getContextualSearchResultHref(
  scope: ContextualSearchScope,
  entityType: ContextualSearchEntity,
  item: ContextualSearchResult,
): string {
  return scope === CONTEXTUAL_SEARCH_SCOPE.INSTITUTIONAL ? getInstitutionalResultHref(entityType, item) : getPlatformResultHref(entityType, item);
}

export function getContextualSearchViewAllHref(scope: ContextualSearchScope, entityType: ContextualSearchEntity, search: string): string | null {
  const searchParams = new URLSearchParams({ search });
  return scope === CONTEXTUAL_SEARCH_SCOPE.INSTITUTIONAL
    ? getInstitutionalCollectionHref(entityType, searchParams)
    : getPlatformCollectionHref(entityType, searchParams);
}

function getPlatformResultHref(entityType: ContextualSearchEntity, item: ContextualSearchResult): string {
  switch (entityType) {
    case "institution":
      return `/admin/institutions/${item.id}`;
    case "platform-account":
      return `/admin/accounts/${item.id}`;
    case "role":
      return `/admin/roles/${item.id}`;
    case "user":
      return `/admin/institutions/${getRequiredInstitutionId(item)}/people/${item.id}`;
    case "academic-year":
    case "training-path":
      return `/admin/institutions/${getRequiredInstitutionId(item)}/academic/${getAcademicResource(entityType)}/${item.id}/edit`;
    case "study-plan":
    case "academic-space":
    case "instrument":
      return `/admin/institutions/${getRequiredInstitutionId(item)}/academic/${getAcademicResource(entityType)}/${item.id}`;
  }
}

function getInstitutionalResultHref(entityType: ContextualSearchEntity, item: ContextualSearchResult): string {
  switch (entityType) {
    case "user":
      return `/people/${item.id}`;
    case "role":
      return `/roles/${item.id}`;
    case "academic-year":
    case "training-path":
      return `/${getAcademicResource(entityType)}/${item.id}/edit`;
    case "study-plan":
    case "academic-space":
    case "instrument":
      return `/${getAcademicResource(entityType)}/${item.id}`;
    case "institution":
    case "platform-account":
      throw new Error(`La entidad ${entityType} no pertenece a la búsqueda institucional.`);
  }
}

function getPlatformCollectionHref(entityType: ContextualSearchEntity, searchParams: URLSearchParams): string {
  switch (entityType) {
    case "institution":
      return `/admin/institutions?${searchParams}`;
    case "platform-account":
      return `/admin/accounts?${searchParams}`;
    case "user":
      return `/admin/people?${searchParams}`;
    case "role":
      return `/admin/roles?${searchParams}`;
    case "academic-year":
    case "training-path":
    case "study-plan":
    case "academic-space":
    case "instrument":
      searchParams.set("type", entityType);
      return `/admin/search?${searchParams}`;
  }
}

function getInstitutionalCollectionHref(entityType: ContextualSearchEntity, searchParams: URLSearchParams): string | null {
  switch (entityType) {
    case "user":
      return `/people?${searchParams}`;
    case "role":
      return `/roles?${searchParams}`;
    case "academic-year": {
      const year = parseAcademicYearFilter(searchParams.get("search")?.trim());
      if (year === undefined) return null;
      searchParams.delete("search");
      searchParams.set("year", String(year));
      return `/${getAcademicResource(entityType)}?${searchParams}`;
    }
    case "training-path":
    case "study-plan":
    case "academic-space":
    case "instrument":
      return `/${getAcademicResource(entityType)}?${searchParams}`;
    case "institution":
    case "platform-account":
      throw new Error(`La entidad ${entityType} no pertenece a la búsqueda institucional.`);
  }
}

function getAcademicResource(entityType: AcademicContextualSearchEntity): string {
  return ACADEMIC_RESOURCE_BY_ENTITY[entityType];
}

function getRequiredInstitutionId(item: ContextualSearchResult): string {
  if (item.institutionId) return item.institutionId;

  throw new Error(`El resultado ${item.id} no tiene una institución asociada.`);
}
