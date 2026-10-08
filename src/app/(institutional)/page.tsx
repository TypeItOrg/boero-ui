import { Suspense, type ReactElement } from "react";

import type { Metadata } from "next";

import { BookOpenIcon, Building2Icon, ClipboardListIcon, GraduationCapIcon, UserRoundIcon } from "lucide-react";

import { AcademicResourceLinks, getReadableAcademicResources } from "@features/academic/components/academic-resource-links";
import { getAcademicAccess } from "@features/academic/utils/academic-access.util";
import { InstitutionalHomeHero } from "@features/institutional-auth/components/institutional-home-hero";
import { InstitutionalHomeSkeleton } from "@features/institutional-auth/components/institutional-home-skeleton";
import { HomeAccessRow, HomeSubsection } from "@features/institutional-auth/components/institutional-home-subsection";
import { fetchInstitutionalPerson } from "@features/institutional-auth/services/fetch-institutional-person.service";
import { requireInstitutionalUser } from "@features/institutional-auth/services/get-institutional-user.service";
import { getGreeting } from "@features/institutional-auth/utils/institutional-greeting.util";
import {
  getInstitutionalAcademicOfferLink,
  getInstitutionalEnrollmentHomeLinks,
  getInstitutionalFormationHomeLinks,
  getInstitutionalHomeLinks,
} from "@features/institutional-auth/utils/institutional-home-access.util";
import { getInstitutionalMetadata } from "@features/institutional-auth/utils/institutional-metadata.util";

export async function generateMetadata(): Promise<Metadata> {
  return getInstitutionalMetadata("Inicio");
}

export default function Home(): ReactElement {
  return (
    <Suspense fallback={<InstitutionalHomeSkeleton />}>
      <InstitutionalHomeContent />
    </Suspense>
  );
}

async function InstitutionalHomeContent(): Promise<ReactElement> {
  const [user, person] = await Promise.all([requireInstitutionalUser(), fetchInstitutionalPerson()]);
  const links = getInstitutionalHomeLinks(user);
  const managementLinks = links.filter((link) => link.href !== "/account");
  const personalLink = links.find((link) => link.href === "/account");
  const academicOfferLink = getInstitutionalAcademicOfferLink(user);
  const academicResources = getReadableAcademicResources(getAcademicAccess(user));
  const enrollmentLinks = getInstitutionalEnrollmentHomeLinks(user);
  const formationLinks = getInstitutionalFormationHomeLinks(user);
  const hasInstitutionalAccess = managementLinks.length > 0;
  const hasAcademicAccess = academicResources.length > 0 || academicOfferLink !== undefined;
  const hasEnrollmentAccess = enrollmentLinks.length > 0;
  const hasManagementTools = hasInstitutionalAccess || hasAcademicAccess || hasEnrollmentAccess;
  const greeting = getGreeting(new Date());
  const primaryRole = user.roles[0] ?? "Usuario institucional";

  return (
    <main className="flex min-h-full flex-1 flex-col gap-4">
      <InstitutionalHomeHero greeting={greeting} user={user} person={person} primaryRole={primaryRole} />

      <div className="flex flex-col gap-4 px-3 pb-3 md:px-4 md:pb-4">
        {academicOfferLink && academicResources.length === 0 ? (
          <HomeSubsection
            id="academic-offer-title"
            title="Oferta académica"
            description="Conocé las propuestas vigentes de la institución."
            icon={GraduationCapIcon}
            imageSrc="/images/academic-management.webp"
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
            imageSrc="/images/institutional-management.webp"
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
            imageSrc="/images/academic-management.webp"
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
                <nav aria-label="Inscripciones académicas" className="[&>a]:bg-background grid gap-4">
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
            title="Cursadas e inscripciones"
            description="Accedé a tus clases y gestioná las cursadas y solicitudes de inscripción."
            icon={ClipboardListIcon}
            imageSrc={!hasInstitutionalAccess ? "/images/institutional-management.webp" : undefined}
          >
            <nav aria-label="Cursadas e inscripciones" className="[&>a]:bg-background grid gap-4">
              {enrollmentLinks.map((link) => (
                <HomeAccessRow key={link.href} link={link} />
              ))}
            </nav>
          </HomeSubsection>
        ) : null}

        {formationLinks.length > 0 ? (
          <HomeSubsection
            id="formation-title"
            title="Formación"
            description="Seguí tu recorrido académico en la institución."
            icon={BookOpenIcon}
            imageSrc="/images/academic-management.webp"
            imageSide="right"
          >
            <nav aria-label="Formación" className="[&>a]:bg-background grid gap-4">
              {formationLinks.map((link) => (
                <HomeAccessRow key={link.href} link={link} />
              ))}
            </nav>
          </HomeSubsection>
        ) : null}

        {!hasManagementTools && formationLinks.length === 0 && personalLink ? (
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
