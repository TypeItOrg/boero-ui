import Link from "next/link";

import { Avatar, AvatarFallback } from "@common/components/ui/avatar";
import { Badge } from "@common/components/ui/badge";
import { Button } from "@common/components/ui/button";
import { Skeleton } from "@common/components/ui/skeleton";
import { fetchPeople } from "@features/people/services/fetch-people.service";
import { DEFAULT_PEOPLE_SORT } from "@features/people/utils/people-pagination.util";

type InstitutionPeoplePreviewProps = {
  institutionId: string;
};

export async function InstitutionPeoplePreview({
  institutionId,
}: InstitutionPeoplePreviewProps): Promise<React.ReactElement> {
  const people = await fetchPeople(institutionId, {
    page: 0,
    size: 5,
    search: "",
    sort: DEFAULT_PEOPLE_SORT,
  }).catch(() => null);

  if (!people) {
    return (
      <aside className="bg-background rounded-2xl p-5 shadow-sm sm:p-6">
        <h2 className="text-foreground font-semibold">Usuarios</h2>
        <p className="text-muted-foreground mt-2 text-sm">No se pudo cargar la vista previa.</p>
      </aside>
    );
  }

  if (people.items.length === 0) {
    return <EmptyPeoplePreview institutionId={institutionId} />;
  }

  return (
    <aside className="bg-background rounded-2xl p-4 shadow-sm sm:p-5">
      <div className="flex items-baseline justify-between gap-4">
        <h2 className="text-foreground font-semibold">Usuarios</h2>
        <p className="text-muted-foreground text-sm tabular-nums">{people.totalItems} en total</p>
      </div>

      <div className="mt-4 grid gap-2">
        {people.items.map((person) => {
          const roles = person.roles ?? [];
          const primaryRole = roles[0];
          const additionalRoleCount = roles.length - 1;

          return (
            <Link
              key={person.id}
              href={`/platform/institutions/${institutionId}/people/${person.id}`}
              className="group bg-muted/40 hover:bg-muted/70 focus-visible:ring-ring grid min-w-0 grid-cols-[auto_minmax(0,1fr)] items-start gap-3 rounded-xl px-3 py-3 transition-colors focus-visible:ring-2 focus-visible:outline-none"
            >
              <Avatar className="size-12">
                <AvatarFallback>{getInitials(person.firstName, person.lastName)}</AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="text-foreground truncate font-medium group-hover:underline">
                  {person.firstName} {person.lastName}
                </p>
                <div className="mt-1 flex min-w-0 items-center gap-2">
                  {primaryRole && (
                    <div className="flex shrink-0 gap-1">
                      <Badge variant="secondary">{primaryRole.displayName}</Badge>
                      {additionalRoleCount > 0 && <Badge variant="secondary">+{additionalRoleCount}</Badge>}
                    </div>
                  )}
                  <p className="text-muted-foreground min-w-0 truncate text-xs">
                    {person.email ?? "Sin correo electrónico"}
                  </p>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      <Button asChild className="mt-3 h-9 w-full justify-center">
        <Link href={`/platform/institutions/${institutionId}/people`}>Ver todos los usuarios</Link>
      </Button>
    </aside>
  );
}

export function InstitutionPeoplePreviewSkeleton(): React.ReactElement {
  return (
    <aside className="bg-background rounded-2xl p-4 shadow-sm sm:p-5">
      <div className="flex items-center justify-between">
        <Skeleton className="h-5 w-20" />
        <Skeleton className="h-4 w-16" />
      </div>
      <div className="mt-4 grid gap-2">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="bg-muted/40 flex items-center gap-3 rounded-xl px-3 py-3">
            <Skeleton className="size-12 shrink-0 rounded-full" />
            <div className="grid min-w-0 flex-1 gap-2">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-3 w-4/5" />
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
}

function EmptyPeoplePreview({ institutionId }: { institutionId: string }): React.ReactElement {
  return (
    <aside className="bg-background rounded-2xl p-5 shadow-sm sm:p-6">
      <h2 className="text-foreground font-semibold">Usuarios</h2>
      <div className="mt-4">
        <p className="text-foreground text-sm font-medium">Todavía no hay usuarios</p>
        <p className="text-muted-foreground mt-1 text-sm">Creá el primero para esta institución.</p>
        <Button asChild size="lg" className="mt-4 w-full">
          <Link href={`/platform/institutions/${institutionId}/people/new`}>Crear usuario</Link>
        </Button>
      </div>
    </aside>
  );
}

function getInitials(firstName: string, lastName: string): string {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}
