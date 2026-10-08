import type { ReactElement } from "react";

import type { Metadata } from "next";

import { InstitutionalUnavailableView } from "@features/institutional-auth/components/institutional-unavailable-view";

export const metadata: Metadata = {
  title: "Acceso institucional no disponible",
  description: "Verificá que el enlace o subdominio ingresado sea correcto, o comunicate con la institución para acceder al portal correspondiente.",
};

type InstitutionalUnavailablePageProps = {
  searchParams: Promise<{
    message?: string;
    status?: string;
  }>;
};

export default async function InstitutionalUnavailablePage({ searchParams }: InstitutionalUnavailablePageProps): Promise<ReactElement> {
  const { message } = await searchParams;
  const homeHref = process.env.FRONTEND_PUBLIC_URL || "/";

  return <InstitutionalUnavailableView message={message} homeHref={homeHref} />;
}
