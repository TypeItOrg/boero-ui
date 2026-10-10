import type { ReactNode } from "react";

import "@app/globals.css";

import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Manrope } from "next/font/google";

import NextTopLoader from "nextjs-toploader";

import { TooltipProvider } from "@common/components/ui/tooltip";
import { getRequestInstitution } from "@common/services/institutional-host/institutional-host.service";
import { cn } from "@common/utils/cn.util";

import type { PublicInstitution } from "@features/institutions/types/public-institution.types";

import { Providers } from "@app/providers";

const manrope = Manrope({ subsets: ["latin"], variable: "--font-sans" });

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export async function generateMetadata(): Promise<Metadata> {
  let institution: PublicInstitution | undefined;

  try {
    institution = await getRequestInstitution();
  } catch {
    institution = undefined;
  }

  const brandName = institution?.name ?? "Boero";

  return {
    title: {
      template: `%s | ${brandName}`,
      default: brandName,
    },
    description: "Plataforma de gestión para instituciones educativas",
    icons: {
      icon: [
        {
          url: "/brand/logo.svg",
          media: "(prefers-color-scheme: light)",
        },
        {
          url: "/brand/logo-dark.svg",
          media: "(prefers-color-scheme: dark)",
        },
      ],
    },
  };
}

export const viewport: Viewport = {
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={cn("h-full", "antialiased", geistSans.variable, geistMono.variable, "font-sans", manrope.variable)}
      suppressHydrationWarning
    >
      <body className="flex min-h-full flex-col">
        <NextTopLoader color="var(--primary)" crawlSpeed={200} height={2} shadow={false} showForHashAnchor={false} showSpinner={false} />
        <Providers>
          <TooltipProvider>{children}</TooltipProvider>
        </Providers>
      </body>
    </html>
  );
}
