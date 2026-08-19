import Link from "next/link";
import { UsersIcon } from "lucide-react";

import { ReturnToLink } from "@common/components/navigation/return-to-link";
import { Avatar, AvatarFallback } from "@common/components/ui/avatar";
import { Badge } from "@common/components/ui/badge";
import { Button } from "@common/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@common/components/ui/card";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@common/components/ui/empty";
import { Skeleton } from "@common/components/ui/skeleton";
import { INSTITUTION_ERROR_MESSAGES } from "@features/institutions/constants/error-messages.constants";
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
      <Card className="bg-muted/25 gap-0 p-5 sm:p-6">
        <CardHeader className="-mx-5 border-b px-5 pb-5 sm:-mx-6 sm:px-6">
          <UsersPreviewHeader />
        </CardHeader>
        <CardContent className="p-0">
          <p className="text-muted-foreground text-sm">{INSTITUTION_ERROR_MESSAGES.PREVIEW_UNAVAILABLE}</p>
        </CardContent>
      </Card>
    );
  }

  if (people.items.length === 0) {
    return <EmptyPeoplePreview institutionId={institutionId} />;
  }

  return (
    <Card className="bg-muted/25 gap-0 p-5 sm:p-6">
      <CardHeader className="-mx-5 border-b px-5 pb-5 sm:-mx-6 sm:px-6">
        <UsersPreviewHeader />
      </CardHeader>
      <CardContent className="p-0">
        <div className="mt-4 flex flex-col gap-4">
          {people.items.map((person) => {
            const roles = person.roles ?? [];
            const primaryRole = roles[0];
            const additionalRoleCount = roles.length - 1;

            return (
              <ReturnToLink
                key={person.id}
                href={`/admin/institutions/${institutionId}/people/${person.id}`}
                className="group focus-visible:ring-ring grid min-w-0 grid-cols-[auto_minmax(0,1fr)] items-start gap-3 px-0 transition-colors focus-visible:ring-2 focus-visible:outline-none"
              >
                <Avatar className="size-12">
                  <AvatarFallback>{getInitials(person.firstName, person.lastName)}</AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="text-foreground truncate font-medium group-hover:underline">
                    {person.firstName} {person.lastName}
                  </p>
                  <div className="mt-1 flex min-w-0 items-center gap-2">
                    {primaryRole ? (
                      <div className="flex shrink-0 gap-1">
                        <Badge variant="secondary">{primaryRole.displayName}</Badge>
                        {additionalRoleCount > 0 && <Badge variant="secondary">+{additionalRoleCount}</Badge>}
                      </div>
                    ) : null}
                    <p className="text-muted-foreground min-w-0 truncate text-xs">
                      {person.email ?? "Sin correo electrónico"}
                    </p>
                  </div>
                </div>
              </ReturnToLink>
            );
          })}
        </div>
        <Button asChild className="mt-4 h-9 w-full justify-center">
          <Link href={`/admin/institutions/${institutionId}/people`}>Ver todos los usuarios</Link>
        </Button>
      </CardContent>
    </Card>
  );
}

export function InstitutionPeoplePreviewSkeleton(): React.ReactElement {
  return (
    <Card className="bg-muted/25 gap-0 p-5 sm:p-6">
      <CardHeader className="-mx-5 border-b px-5 pb-5 sm:-mx-6 sm:px-6">
        <UsersPreviewHeaderSkeleton />
      </CardHeader>
      <CardContent className="p-0">
        <div className="flex flex-col gap-4">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="bg-muted/40 flex items-center gap-3 rounded-xl px-0">
              <Skeleton className="size-12 shrink-0 rounded-full" />
              <div className="grid min-w-0 flex-1 gap-2">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-3 w-4/5" />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function EmptyPeoplePreview({ institutionId }: { institutionId: string }): React.ReactElement {
  return (
    <Card className="bg-muted/25 gap-0 p-5 sm:p-6">
      <CardHeader className="-mx-5 border-b px-5 pb-5 sm:-mx-6 sm:px-6">
        <UsersPreviewHeader />
      </CardHeader>
      <CardContent className="mt-4 p-0">
        <Empty className="border-0 p-0">
          <EmptyHeader>
            <EmptyMedia variant="icon" className="bg-muted text-muted-foreground mb-4 size-16 rounded-full">
              <UsersIcon className="size-8" />
            </EmptyMedia>
            <EmptyTitle className="text-base font-semibold">Todavía no hay usuarios</EmptyTitle>
            <EmptyDescription className="text-sm">Creá el primero para esta institución.</EmptyDescription>
          </EmptyHeader>
          <EmptyContent className="mt-2 w-full">
            <Button asChild size="lg" className="w-full justify-center">
              <ReturnToLink href={`/admin/institutions/${institutionId}/people/new`}>Crear usuario</ReturnToLink>
            </Button>
          </EmptyContent>
        </Empty>
      </CardContent>
    </Card>
  );
}

function UsersPreviewHeader(): React.ReactElement {
  return (
    <div className="flex items-stretch justify-between gap-4">
      <div className="flex items-stretch gap-3.5">
        <div className="bg-primary/10 text-primary flex aspect-square min-h-11 min-w-11 shrink-0 items-center justify-center self-stretch rounded-xl">
          <UsersIcon className="size-5" aria-hidden="true" />
        </div>
        <div className="flex min-w-0 flex-col justify-center">
          <CardTitle>Usuarios</CardTitle>
          <CardDescription>Personas con acceso a la institución.</CardDescription>
        </div>
      </div>
    </div>
  );
}

function UsersPreviewHeaderSkeleton(): React.ReactElement {
  return (
    <div className="flex items-stretch justify-between gap-4">
      <div className="flex items-stretch gap-3.5">
        <Skeleton className="min-h-11 min-w-11 rounded-xl" />
        <div className="grid content-center gap-2">
          <Skeleton className="h-5 w-20" />
          <Skeleton className="h-4 w-44" />
        </div>
      </div>
      <Skeleton className="h-4 w-16 self-center" />
    </div>
  );
}

function getInitials(firstName: string, lastName: string): string {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}
