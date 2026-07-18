"use client";

import { InstitutionalLogoutButton } from "@features/institutional-auth/components/institutional-logout-button";
import { useInstitutionalUser } from "@features/institutional-auth/hooks/use-institutional-user.hook";
import type { InstitutionalUser } from "@features/institutional-auth/types/institutional-user.types";

export function InstitutionalUserCard(): React.ReactElement {
  const { user } = useInstitutionalUser();

  return (
    <section className="bg-background w-full max-w-lg rounded-xl border p-8 shadow-sm">
      <p className="text-muted-foreground text-sm">Portal institucional</p>

      {user ? <UserProfile user={user} /> : <UnavailableProfile />}

      <InstitutionalLogoutButton />
    </section>
  );
}

function UserProfile({ user }: { user: InstitutionalUser }): React.ReactElement {
  return (
    <>
      <h1 className="mt-2 text-2xl font-bold">Bienvenido, {user.name}</h1>
      <p className="text-muted-foreground mt-2">Ya estás autenticado en tu institución.</p>

      <dl className="mt-6 grid gap-4 border-t pt-6 sm:grid-cols-2">
        <ProfileValue label="Nombre completo" value={`${user.name} ${user.lastName}`} />
        <ProfileValue label="Documento" value={user.documentNumber} />
        {/* <ProfileValue label="ID de usuario" value={user.userId} />
        <ProfileValue label="ID de persona" value={user.personId ?? "—"} />
        <ProfileValue label="ID de institución" value={user.institutionId} /> */}
      </dl>
    </>
  );
}

function ProfileValue({ label, value }: { label: string; value: string }): React.ReactElement {
  return (
    <div className="min-w-0">
      <dt className="text-muted-foreground text-xs font-medium tracking-wider uppercase">{label}</dt>
      <dd className="mt-1 text-sm font-medium break-all">{value}</dd>
    </div>
  );
}

function UnavailableProfile(): React.ReactElement {
  return (
    <>
      <h1 className="mt-2 text-2xl font-bold">No pudimos cargar tu perfil</h1>
      <p className="text-muted-foreground mt-2">
        La sesión existe, pero no pudimos obtener los datos del usuario. Intentá cerrar sesión y volver a ingresar.
      </p>
    </>
  );
}
