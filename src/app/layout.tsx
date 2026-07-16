import type { Metadata } from "next";
import { Geist, Geist_Mono, Manrope } from "next/font/google";
import NextTopLoader from "nextjs-toploader";
import "./globals.css";

import { cn } from "@common/utils/cn.util";
import { TooltipProvider } from "@common/components/ui/tooltip";
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

export const metadata: Metadata = {
  title: {
    template: "%s | Boero",
    default: "Boero",
  },
  description: "Plataforma de gestión para instituciones educativas",
  icons: {
    icon: [
      {
        url: "/logo.svg",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/logo-dark.svg",
        media: "(prefers-color-scheme: dark)",
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={cn("h-full", "antialiased", geistSans.variable, geistMono.variable, "font-sans", manrope.variable)}
      suppressHydrationWarning
    >
      <body className="flex min-h-full flex-col">
        <NextTopLoader
          color="var(--primary)"
          crawlSpeed={200}
          height={2}
          shadow={false}
          showForHashAnchor={false}
          showSpinner={false}
        />
        <Providers>
          <TooltipProvider>{children}</TooltipProvider>
        </Providers>
      </body>
    </html>
  );
}
