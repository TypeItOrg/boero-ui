import Link from "next/link";

import { Button } from "@common/components/ui/button";

export function EnrollmentCatalogPagination({
  page,
  totalPages,
  parameter,
  query,
  label,
}: {
  page: number;
  totalPages: number;
  parameter: "plansPage" | "periodsPage";
  query: Record<string, string | undefined>;
  label: string;
}) {
  function pageHref(nextPage: number): string {
    const params = new URLSearchParams();

    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined) {
        params.set(key, value);
      }
    }

    params.set(parameter, String(nextPage));

    return `?${params.toString()}`;
  }

  return (
    <nav aria-label={label} className="flex items-center justify-between gap-2 text-sm">
      {page > 0 ? (
        <Button asChild variant="outline" size="sm">
          <Link href={pageHref(page - 1)} scroll={false}>
            Anterior
          </Link>
        </Button>
      ) : (
        <Button variant="outline" size="sm" disabled>
          Anterior
        </Button>
      )}
      <span className="text-muted-foreground">
        Página {page + 1} de {totalPages}
      </span>
      {page + 1 < totalPages ? (
        <Button asChild variant="outline" size="sm">
          <Link href={pageHref(page + 1)} scroll={false}>
            Siguiente
          </Link>
        </Button>
      ) : (
        <Button variant="outline" size="sm" disabled>
          Siguiente
        </Button>
      )}
    </nav>
  );
}
