import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { fetchInstitutionalPerson } from "@features/institutional-auth/services/fetch-institutional-person.service";
import { requireInstitutionalUser } from "@features/institutional-auth/services/get-institutional-user.service";
import {
  getInstitutionalHomeLinks,
  type InstitutionalHomeLink,
} from "@features/institutional-auth/utils/institutional-home-access.util";
import { getInstitutionalMetadata } from "@features/institutional-auth/utils/institutional-metadata.util";

export async function generateMetadata(): Promise<Metadata> {
  return getInstitutionalMetadata("Inicio");
}

export default async function Home(): Promise<React.ReactElement> {
  const user = await requireInstitutionalUser();
  const person = await fetchInstitutionalPerson();
  const links = getInstitutionalHomeLinks(user);
  const managementLinks = links.filter((link) => link.href !== "/profile");
  const greeting = getGreeting();

  return (
    <main className="flex min-h-full flex-col gap-4 p-4">
      <header className="bg-background flex flex-row items-center justify-between gap-4 rounded-xl p-6 shadow-xs">
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <p className="text-muted-foreground text-sm font-medium">{person?.institutionName ?? "Institución"}</p>
          <div>
            <h1 className="text-foreground text-2xl font-semibold tracking-tight text-balance sm:text-3xl">
              {greeting}, {user.name}
            </h1>
            <p className="text-muted-foreground mt-1 text-sm">
              Podés administrar tus accesos y herramientas de gestión desde acá.
            </p>
          </div>
        </div>
        <Image
          src="/boero-logo.png"
          alt="Logo Boero"
          width={875}
          height={1202}
          priority
          className="hidden h-12 w-auto shrink-0 object-contain sm:block sm:h-[88px]"
        />
      </header>

      {managementLinks.length > 0 ? (
        <section
          aria-labelledby="management-title"
          className="bg-background flex flex-col gap-6 rounded-xl p-6 shadow-xs"
        >
          <div>
            <h2 id="management-title" className="text-xl font-semibold tracking-tight sm:text-2xl">
              Gestión institucional
            </h2>
            <p className="text-muted-foreground mt-1 text-sm">
              Administrá las personas y los accesos de la institución.
            </p>
          </div>

          <nav aria-label="Herramientas de gestión" className="flex flex-wrap gap-4">
            {managementLinks.map((link) => (
              <HomeAccessRow key={link.href} link={link} />
            ))}
          </nav>
        </section>
      ) : null}
    </main>
  );
}

function HomeAccessRow({ link }: { link: InstitutionalHomeLink }): React.ReactElement {
  const Icon = link.icon;

  return (
    <Link
      href={link.href}
      className="bg-muted/25 hover:bg-muted/40 focus-visible:bg-muted/40 focus-visible:ring-ring flex min-w-0 flex-[1_0_min(500px,100%)] flex-row items-center justify-between gap-4 rounded-xl border p-6 transition-colors focus-visible:ring-2 focus-visible:outline-none focus-visible:ring-inset"
    >
      <div className="flex min-w-0 flex-col gap-1">
        <span className="text-base font-semibold tracking-tight sm:text-lg">{link.title}</span>
        <span className="text-muted-foreground text-sm leading-relaxed">{link.description}</span>
      </div>
      <div className="bg-background text-primary flex size-12 shrink-0 items-center justify-center rounded-xl border shadow-xs">
        <Icon aria-hidden="true" className="size-6" />
      </div>
    </Link>
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
