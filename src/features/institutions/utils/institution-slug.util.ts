const MAX_INSTITUTION_SLUG_LENGTH = 100;

export function createInstitutionSlug(name: string): string {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, MAX_INSTITUTION_SLUG_LENGTH)
    .replace(/-+$/g, "");
}
