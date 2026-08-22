import { Suspense } from "react";
import type { Metadata } from "next";
import Image from "next/image";
import { Building2Icon, GraduationCapIcon, type LucideIcon, UserRoundIcon } from "lucide-react";

import { NavigationCard } from "@common/components/navigation/navigation-card";
import { Separator } from "@common/components/ui/separator";
import { cn } from "@common/utils/cn.util";
import { AcademicResourceLinks, getReadableAcademicResources } from "@features/academic/components/academic-resource-links";
import { getAcademicAccess } from "@features/academic/utils/academic-access.util";
import { InstitutionalHomeSkeleton } from "@features/institutional-auth/components/institutional-home-skeleton";
import { fetchInstitutionalPerson } from "@features/institutional-auth/services/fetch-institutional-person.service";
import { requireInstitutionalUser } from "@features/institutional-auth/services/get-institutional-user.service";
import { getInstitutionalHomeLinks, type InstitutionalHomeLink } from "@features/institutional-auth/utils/institutional-home-access.util";
import { getInstitutionalMetadata } from "@features/institutional-auth/utils/institutional-metadata.util";

type HomeAccessRowProps = {
  link: InstitutionalHomeLink;
};

type HomeSubsectionProps = {
  children: React.ReactNode;
  icon: LucideIcon;
  id: string;
  imageSide?: "left" | "right";
  imageSrc?: string;
  title: string;
};

const argentinaHourFormatter = new Intl.DateTimeFormat("es-AR", {
  hour: "numeric",
  hourCycle: "h23",
  timeZone: "America/Argentina/Cordoba",
});

export async function generateMetadata(): Promise<Metadata> {
  return getInstitutionalMetadata("Inicio");
}

export default function Home(): React.ReactElement {
  return (
    <Suspense fallback={<InstitutionalHomeSkeleton />}>
      <InstitutionalHomeContent />
    </Suspense>
  );
}

async function InstitutionalHomeContent(): Promise<React.ReactElement> {
  const [user, person] = await Promise.all([requireInstitutionalUser(), fetchInstitutionalPerson()]);
  const links = getInstitutionalHomeLinks(user);
  const managementLinks = links.filter((link) => link.href !== "/profile");
  const personalLink = links.find((link) => link.href === "/profile");
  const academicResources = getReadableAcademicResources(getAcademicAccess(user));
  const hasInstitutionalAccess = managementLinks.length > 0;
  const hasAcademicAccess = academicResources.length > 0;
  const hasManagementTools = hasInstitutionalAccess || hasAcademicAccess;
  const greeting = getGreeting(new Date());
  const primaryRole = user.roles[0] ?? "Usuario institucional";

  return (
    <main className="flex min-h-full flex-1 flex-col gap-4">
      <header className="relative flex h-56 min-w-0 items-center overflow-hidden shadow-sm sm:h-64">
        <Image src="/encabezado-institucional.webp" alt="" fill sizes="100vw" quality={90} preload className="object-cover object-center" />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-linear-to-r from-black/80 via-black/60 to-black/25 sm:from-black/85 sm:via-black/60 sm:via-[65%] sm:to-black/15 sm:to-[90%] 2xl:from-black/85 2xl:via-black/50 2xl:via-[50%] 2xl:to-black/5 2xl:to-[100%] dark:bg-black/20"
        />
        <div aria-hidden="true" className="absolute inset-0 bg-linear-to-t from-black/20 via-transparent to-transparent dark:from-black/35" />
        <div className="relative flex max-w-3xl min-w-0 items-center gap-4 p-5 text-white sm:p-6 lg:p-8">
          <Image
            width={875}
            height={1202}
            src="/boero-logo.webp"
            alt="Logo del Conservatorio Superior de Música Felipe Boero"
            className="h-32 w-24 shrink-0 object-contain"
          />
          <div className="flex h-32 min-w-0 flex-col justify-center gap-4 py-1 sm:h-36 sm:py-2">
            <div>
              <h1 id="institution-home-title" className="text-2xl font-bold tracking-tight text-pretty drop-shadow-sm sm:text-4xl">
                <span className="sm:hidden">Hola,</span>
                <span className="hidden sm:inline">{greeting},</span> {user.name}
              </h1>
              <p className="line-clamp-1 text-sm leading-snug font-medium text-white drop-shadow-sm sm:line-clamp-none sm:text-base sm:text-white/85">
                {person?.institutionName ?? "Institución"}
              </p>
            </div>
            <div className="flex flex-col gap-1.5 text-sm font-medium text-white/90 drop-shadow-sm sm:flex-row sm:items-center sm:gap-4 sm:text-base sm:text-white/75">
              <p>Portal Institucional</p>
              <Separator orientation="vertical" className="hidden bg-white/30 sm:block" />
              <p className="w-fit max-w-full truncate rounded-full bg-white/15 px-2.5 py-0.5 text-xs font-semibold text-white ring-1 ring-white/20 backdrop-blur-sm sm:text-sm">
                {primaryRole}
              </p>
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-col gap-4 px-3 pb-3 md:px-4 md:pb-4">
        {managementLinks.length > 0 ? (
          <HomeSubsection
            id="institutional-management-title"
            title="Gestión institucional"
            icon={Building2Icon}
            imageSrc="/gestion-institucional.webp"
          >
            <nav aria-label="Gestión institucional" className="[&>a]:bg-background grid gap-4">
              {managementLinks.map((link) => (
                <HomeAccessRow key={link.href} link={link} />
              ))}
            </nav>
          </HomeSubsection>
        ) : null}

        {academicResources.length > 0 ? (
          <HomeSubsection
            id="academic-management-title"
            title="Gestión académica"
            icon={GraduationCapIcon}
            imageSrc="/gestion-academica.webp"
            imageSide="right"
          >
            <AcademicResourceLinks basePath="" resources={academicResources} prominent className="[&>a]:bg-background" />
          </HomeSubsection>
        ) : null}

        {!hasManagementTools && personalLink ? (
          <HomeSubsection id="personal-space-title" title="Mi espacio" icon={UserRoundIcon}>
            <nav aria-label="Herramientas personales" className="[&>a]:bg-background grid gap-4">
              <HomeAccessRow link={personalLink} />
            </nav>
          </HomeSubsection>
        ) : null}
      </div>
    </main>
  );
}

function HomeAccessRow({ link }: HomeAccessRowProps): React.ReactElement {
  return <NavigationCard href={link.href} icon={link.icon} title={link.title} description={link.description} prominent />;
}

function HomeSubsection({ children, icon: Icon, id, imageSide = "left", imageSrc, title }: HomeSubsectionProps): React.ReactElement {
  return (
    <section aria-labelledby={id} className="bg-background flex flex-col gap-4 rounded-xl border p-4 shadow-xs sm:p-5">
      <div className="flex items-stretch justify-between gap-4">
        <div className="min-w-0">
          <h2 id={id} className="text-xl leading-none font-bold tracking-tight">
            {title}
          </h2>
        </div>
        <div className="from-primary to-primary/80 text-primary-foreground flex h-full shrink-0 items-center justify-center rounded-xl bg-linear-to-br p-3 shadow-xs">
          <Icon aria-hidden="true" />
        </div>
      </div>
      {imageSrc ? (
        <div
          className={cn(
            "grid gap-4",
            imageSide === "right" ? "lg:grid-cols-[minmax(0,2fr)_minmax(200px,0.7fr)]" : "lg:grid-cols-[minmax(200px,0.7fr)_minmax(0,2fr)]",
          )}
        >
          <div className={cn("bg-muted relative h-44 overflow-hidden rounded-lg border sm:h-52 lg:h-92", imageSide === "right" && "lg:order-2")}>
            <Image src={imageSrc} alt="" fill sizes="(max-width: 1023px) 100vw, 28vw" className="object-cover" />
          </div>
          <div className={cn("min-w-0", imageSide === "right" && "lg:order-1")}>{children}</div>
        </div>
      ) : (
        children
      )}
    </section>
  );
}

function getGreeting(date: Date): "Buenos días" | "Buenas tardes" | "Buenas noches" {
  const hour = Number(argentinaHourFormatter.format(date));
  if (hour < 12) return "Buenos días";
  if (hour < 20) return "Buenas tardes";
  return "Buenas noches";
}
