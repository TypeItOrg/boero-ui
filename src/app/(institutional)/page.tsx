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
import { Building2Icon } from "lucide-react";

export async function generateMetadata(): Promise<Metadata> {
  return getInstitutionalMetadata("Inicio");
}

export default async function Home(): Promise<React.ReactElement> {
  const user = await requireInstitutionalUser();
  const person = await fetchInstitutionalPerson();
  const links = getInstitutionalHomeLinks(user);
  const managementLinks = links.filter((link) => link.href !== "/profile");

  return (
    <main className="flex min-h-full flex-col gap-4 p-3 md:p-4">
      <header className="bg-background flex flex-row items-center justify-between gap-4 rounded-xl p-4 shadow-xs sm:p-6">
        <div className="flex h-full min-w-0 flex-1 gap-4">
          <div className="min-w-0 flex-1">
            <p className="text-muted-foreground truncate text-sm font-medium">
              {person?.institutionName ?? "Institución"}
            </p>
            <h1 className="text-foreground mt-2 truncate text-2xl font-bold tracking-tight sm:mt-1 sm:text-3xl">
              Hola, {user.name}
            </h1>

            <p className="text-muted-foreground mt-1 text-sm sm:hidden">
              Gestioná tus accesos y herramientas desde un solo lugar.
            </p>

            <p className="text-muted-foreground mt-1 hidden text-sm sm:block">
              Podés administrar tus accesos y herramientas de gestión desde acá.
            </p>
          </div>

          <Image
            src="/boero-logo.png"
            alt="Logo Boero"
            width={875}
            height={1202}
            priority
            className="h-26 w-auto shrink-0 object-contain sm:hidden"
          />
        </div>

        <Image
          src="/boero-logo.png"
          alt="Logo Boero"
          width={875}
          height={1202}
          priority
          className="hidden h-21 w-auto shrink-0 object-contain sm:block"
        />
      </header>

      {managementLinks.length > 0 ? (
        <section
          aria-labelledby="management-title"
          className="bg-background flex flex-col gap-6 rounded-xl p-4 shadow-xs sm:p-6"
        >
          <div className="flex justify-between gap-4">
            <div className="flex flex-col">
              <h2 id="management-title" className="text-xl leading-none font-semibold tracking-tight sm:text-2xl">
                Gestión institucional
              </h2>

              <p className="text-muted-foreground mt-1 text-sm">
                <span className="hidden sm:block">Administrá las personas y los accesos de la institución.</span>
                <span className="sm:hidden">Administrá las personas y los accesos.</span>
              </p>
            </div>

            <div className="text-muted-foreground bg-accent flex items-center justify-center rounded-xl p-2">
              <Building2Icon />
            </div>
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
      className="bg-muted/25 hover:bg-muted/40 focus-visible:bg-muted/40 focus-visible:ring-ring flex min-w-0 flex-[1_0_min(500px,100%)] flex-row items-center justify-between gap-4 rounded-xl border p-4 transition-colors focus-visible:ring-2 focus-visible:outline-none focus-visible:ring-inset sm:p-6"
    >
      <div className="flex min-w-0 flex-col gap-1">
        <span className="text-base font-semibold tracking-tight sm:text-lg">{link.title}</span>
        <span className="text-muted-foreground text-sm leading-relaxed">{link.description}</span>
      </div>
      <div className="bg-background text-primary flex size-12 h-full shrink-0 items-center justify-center rounded-xl border shadow-xs">
        <Icon aria-hidden="true" className="size-6" />
      </div>
    </Link>
  );
}
