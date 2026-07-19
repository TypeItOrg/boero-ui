import Link from "next/link";
import { ArrowRightIcon, UsersIcon, UserRoundIcon } from "lucide-react";

import { Button } from "@common/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@common/components/ui/card";
import { fetchInstitutionalPerson } from "@features/institutional-auth/services/fetch-institutional-person.service";
import { requireInstitutionalUser } from "@features/institutional-auth/services/get-institutional-user.service";
import { INSTITUTIONAL_PERMISSION } from "@features/institutional-auth/types/institutional-permission.types";
import { hasInstitutionalPermission } from "@features/institutional-auth/utils/institutional-permission.util";

export default async function Home(): Promise<React.ReactElement> {
  const user = await requireInstitutionalUser();
  const person = await fetchInstitutionalPerson();
  const canManagePeople = hasInstitutionalPermission(user, INSTITUTIONAL_PERMISSION.PERSON_READ_ANY);
  const greeting = getGreeting();

  return (
    <main className="flex h-full flex-col gap-5 p-4">
      <header className="bg-background rounded-xl p-5 shadow-xs sm:p-6">
        <p className="text-muted-foreground text-sm">{person?.institutionName ?? "Institución"}</p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
          {greeting}, {user.name}
        </h1>
        <p className="text-muted-foreground mt-2 max-w-2xl text-sm">
          Gestioná tus datos personales y accedé a los recursos de tu institución desde un mismo lugar.
        </p>
      </header>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(280px,360px)]">
        <Card className="p-5 sm:p-6">
          <CardHeader className="p-0">
            <CardTitle>Tu perfil</CardTitle>
            <CardDescription>Revisá y mantené actualizada tu información personal.</CardDescription>
          </CardHeader>
          <CardContent className="mt-5 flex flex-col gap-4 p-0 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-primary/10 text-primary flex size-11 items-center justify-center rounded-xl">
                <UserRoundIcon />
              </div>
              <div>
                <p className="font-medium">
                  {person ? `${person.firstName} ${person.lastName}` : "Perfil no disponible"}
                </p>
                <p className="text-muted-foreground text-sm">{person?.email || "Completá tus datos"}</p>
              </div>
            </div>
            <Button asChild variant="outline" size="lg">
              <Link href="/profile">
                Ver mi perfil <ArrowRightIcon data-icon="inline-end" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="p-5 sm:p-6">
          <CardHeader className="p-0">
            <CardTitle>Institución</CardTitle>
            <CardDescription>{person?.institutionName ?? "Tu espacio institucional"}</CardDescription>
          </CardHeader>
          <CardContent className="mt-5 p-0">
            <div className="bg-muted flex items-center gap-3 rounded-lg p-4">
              <UsersIcon className="text-primary" />
              <span className="text-sm">
                {canManagePeople
                  ? "Tenés acceso a la gestión de usuarios."
                  : "Consultá tus datos y mantené tu perfil actualizado."}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {canManagePeople ? (
        <Card className="p-5 sm:p-6">
          <CardHeader className="p-0">
            <CardTitle>Gestión institucional</CardTitle>
            <CardDescription>Accedé rápidamente a las tareas de tu organización.</CardDescription>
          </CardHeader>
          <CardContent className="mt-5 p-0">
            <Button asChild size="lg">
              <Link href="/people">
                Ver usuarios <ArrowRightIcon data-icon="inline-end" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : null}
    </main>
  );
}

function getGreeting(): string {
  const currentHour = Number(
    new Intl.DateTimeFormat("es-AR", {
      hour: "2-digit",
      hourCycle: "h23",
      timeZone: "America/Argentina/Cordoba",
    }).format(new Date()),
  );

  if (currentHour < 5 || currentHour >= 20) return "Buenas noches";
  if (currentHour < 12) return "Buenos días";

  return "Buenas tardes";
}
