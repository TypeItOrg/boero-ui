import { Suspense } from "react";
import type { Metadata } from "next";
import Image from "next/image";
import { Building2Icon, ClipboardListIcon, GraduationCapIcon, type LucideIcon, UserRoundIcon } from "lucide-react";

import { NavigationCard } from "@common/components/navigation/navigation-card";
import { Separator } from "@common/components/ui/separator";
import { cn } from "@common/utils/cn.util";
import { AcademicResourceLinks, getReadableAcademicResources } from "@features/academic/components/academic-resource-links";
import { getAcademicAccess } from "@features/academic/utils/academic-access.util";
import { InstitutionalHomeSkeleton } from "@features/institutional-auth/components/institutional-home-skeleton";
import { fetchInstitutionalPerson } from "@features/institutional-auth/services/fetch-institutional-person.service";
import { requireInstitutionalUser } from "@features/institutional-auth/services/get-institutional-user.service";
import {
  getInstitutionalEnrollmentHomeLinks,
  getInstitutionalHomeLinks,
  type InstitutionalHomeLink,
} from "@features/institutional-auth/utils/institutional-home-access.util";
import { getInstitutionalMetadata } from "@features/institutional-auth/utils/institutional-metadata.util";

type HomeAccessRowProps = {
  link: InstitutionalHomeLink;
};

type HomeSubsectionProps = {
  children: React.ReactNode;
  description: string;
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
  const managementLinks = links.filter((link) => link.href !== "/account");
  const personalLink = links.find((link) => link.href === "/account");
  const academicOfferLink = getInstitutionalAcademicOfferLink(user);
  const academicResources = getReadableAcademicResources(getAcademicAccess(user));
  const enrollmentLinks = getInstitutionalEnrollmentHomeLinks(user);
  const hasInstitutionalAccess = managementLinks.length > 0;
  const hasAcademicAccess = academicResources.length > 0;
  const hasEnrollmentAccess = enrollmentLinks.length > 0;
  const hasManagementTools = hasInstitutionalAccess || hasAcademicAccess || hasEnrollmentAccess;
  const greeting = getGreeting(new Date());
  const primaryRole = user.roles[0] ?? "Usuario institucional";

  return (
    <main className="flex min-h-full flex-1 flex-col gap-4">
      <header className="@container/home-hero relative flex h-56 min-w-0 items-center overflow-hidden shadow-sm @2xl/home-hero:h-64">
        <Image src="/encabezado-institucional.webp" alt="" fill sizes="100vw" quality={90} preload className="object-cover object-center" />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-linear-to-r from-black/80 via-black/60 to-black/25 sm:from-black/85 sm:via-black/60 sm:via-[65%] sm:to-black/15 sm:to-[90%] 2xl:from-black/85 2xl:via-black/50 2xl:via-[50%] 2xl:to-black/5 2xl:to-[100%] dark:bg-black/20"
        />
        <div aria-hidden="true" className="absolute inset-0 bg-linear-to-t from-black/20 via-transparent to-transparent dark:from-black/35" />
        <div className="relative flex max-w-3xl min-w-0 items-center gap-4 p-5 text-white @2xl/home-hero:p-6 @4xl/home-hero:p-8">
          <Image
            width={875}
            height={1202}
            src="/boero-logo.webp"
            alt="Logo del Conservatorio Superior de Música Felipe Boero"
            className="h-28 w-20 shrink-0 object-contain @2xl/home-hero:h-32 @2xl/home-hero:w-24"
          />
          <div className="flex h-28 min-w-0 flex-col justify-center gap-3 py-1 @2xl/home-hero:h-32 @2xl/home-hero:gap-4 @4xl/home-hero:h-36 @4xl/home-hero:py-2">
            <div>
              <h1
                id="institution-home-title"
                className="text-2xl font-bold tracking-tight text-pretty drop-shadow-sm @2xl/home-hero:text-3xl @4xl/home-hero:text-4xl"
              >
                <span className="@2xl/home-hero:hidden">Hola,</span>
                <span className="hidden @2xl/home-hero:inline">{greeting},</span> {user.name}
              </h1>
              <p className="line-clamp-1 text-sm leading-snug font-medium text-white drop-shadow-sm @2xl/home-hero:line-clamp-none @2xl/home-hero:text-base @2xl/home-hero:text-white/85">
                {person?.institutionName ?? "Institución"}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-sm font-medium text-white/90 drop-shadow-sm @2xl/home-hero:gap-x-4 @2xl/home-hero:text-base @2xl/home-hero:text-white/75">
              <p>Portal Institucional</p>
              <Separator orientation="vertical" className="hidden bg-white/30 @2xl/home-hero:block" />
              <p className="w-fit max-w-full truncate rounded-full bg-white/15 px-2.5 py-0.5 text-xs font-semibold text-white ring-1 ring-white/20 backdrop-blur-sm @2xl/home-hero:text-sm">
                {primaryRole}
              </p>
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-col gap-4 px-3 pb-3 md:px-4 md:pb-4">
        {academicOfferLink && academicResources.length === 0 ? (
          <HomeSubsection
            id="academic-offer-title"
            title="Oferta académica"
            description="Conocé las propuestas vigentes de la institución."
            icon={GraduationCapIcon}
            imageSrc="/gestion-academica.webp"
            imageSide="right"
          >
            <nav aria-label="Oferta académica" className="[&>a]:bg-background grid gap-4">
              <HomeAccessRow link={academicOfferLink} />
            </nav>
          </HomeSubsection>
        ) : null}

        {managementLinks.length > 0 ? (
          <HomeSubsection
            id="institutional-management-title"
            title="Gestión institucional"
            description="Administrá la información, las personas y los accesos de la institución."
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
            title="Área académica"
            description="Consultá y administrá la propuesta académica y sus inscripciones."
            icon={GraduationCapIcon}
            imageSrc="/gestion-academica.webp"
            imageSide="right"
          >
            <div className="flex flex-col gap-4">
              <AcademicResourceLinks
                basePath=""
                resources={academicResources}
                leadingContent={academicOfferLink ? <HomeAccessRow link={academicOfferLink} /> : undefined}
                prominent
                className="[&>a]:bg-background"
              />
              {enrollmentLinks.length > 0 ? (
                <nav
                  aria-label="Inscripciones académicas"
                  className={cn("[&>a]:bg-background grid gap-4", enrollmentLinks.length > 1 && "sm:grid-cols-2")}
                >
                  {enrollmentLinks.map((link) => (
                    <HomeAccessRow key={link.href} link={link} />
                  ))}
                </nav>
              ) : null}
            </div>
          </HomeSubsection>
        ) : null}

        {enrollmentLinks.length > 0 && academicResources.length === 0 ? (
          <HomeSubsection
            id="enrollment-management-title"
            title="Inscripciones"
            description="Gestioná y consultá tus trámites y solicitudes de inscripción."
            icon={ClipboardListIcon}
            imageSrc={!hasInstitutionalAccess ? "/gestion-institucional.webp" : undefined}
          >
            <nav
              aria-label="Inscripciones"
              className={cn("[&>a]:bg-background grid gap-4", hasInstitutionalAccess && enrollmentLinks.length > 1 && "sm:grid-cols-2")}
            >
              {enrollmentLinks.map((link) => (
                <HomeAccessRow key={link.href} link={link} />
              ))}
            </nav>
          </HomeSubsection>
        ) : null}

        {!hasManagementTools && personalLink ? (
          <HomeSubsection
            id="personal-space-title"
            title="Mi espacio"
            description="Accedé a la configuración y seguridad de tu cuenta."
            icon={UserRoundIcon}
          >
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

function HomeSubsection({ children, description, icon: Icon, id, imageSide = "left", imageSrc, title }: HomeSubsectionProps): React.ReactElement {
  return (
    <section aria-labelledby={id} className="bg-background @container/home-section flex flex-col gap-4 rounded-xl border p-4 shadow-xs sm:p-5">
      <div className="flex items-stretch justify-between gap-4">
        <div className="min-w-0">
          <h2 id={id} className="text-xl leading-none font-bold tracking-tight">
            {title}
          </h2>
          <p className="text-muted-foreground mt-1.5 text-sm">{description}</p>
        </div>
        <div className="from-primary to-primary/80 text-primary-foreground flex h-full shrink-0 items-center justify-center rounded-xl bg-linear-to-br p-3 shadow-xs">
          <Icon aria-hidden="true" />
        </div>
      </div>
      {imageSrc ? (
        <div
          className={cn(
            "grid gap-4",
            imageSide === "right"
              ? "@5xl/home-section:grid-cols-[minmax(0,2fr)_minmax(200px,0.7fr)]"
              : "@5xl/home-section:grid-cols-[minmax(200px,0.7fr)_minmax(0,2fr)]",
          )}
        >
          <div
            className={cn(
              "bg-muted relative h-44 overflow-hidden rounded-lg border sm:h-52 @5xl/home-section:h-auto",
              imageSide === "right" && "@5xl/home-section:order-2",
            )}
          >
            <Image src={imageSrc} alt="" fill sizes="(max-width: 1023px) 100vw, 28vw" className="object-cover" />
          </div>
          <div className={cn("@container/home-content min-w-0", imageSide === "right" && "@5xl/home-section:order-1")}>{children}</div>
        </div>
      ) : (
        <div className="@container/home-content min-w-0">{children}</div>
      )}
    </section>
  );
}

function getGreeting(date: Date): "Buenos días" | "Buenas tardes" | "Buenas noches" {
  const hour = Number(argentinaHourFormatter.format(date));

  if (hour < 12) {
    return "Buenos días";
  }

  if (hour < 20) {
    return "Buenas tardes";
  }

  return "Buenas noches";
}
