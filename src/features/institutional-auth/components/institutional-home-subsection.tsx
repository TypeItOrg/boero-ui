import type { ReactElement, ReactNode } from "react";

import Image from "next/image";

import { type LucideIcon } from "lucide-react";

import { NavigationCard } from "@common/components/navigation/navigation-card";
import { cn } from "@common/utils/cn.util";

import { type InstitutionalHomeLink } from "@features/institutional-auth/utils/institutional-home-access.util";

export function HomeAccessRow({ link }: HomeAccessRowProps): ReactElement {
  return <NavigationCard href={link.href} icon={link.icon} title={link.title} description={link.description} prominent />;
}

export function HomeSubsection({ children, description, icon: Icon, id, imageSide = "left", imageSrc, title }: HomeSubsectionProps): ReactElement {
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

export type HomeAccessRowProps = {
  link: InstitutionalHomeLink;
};

export type HomeSubsectionProps = {
  children: ReactNode;
  description: string;
  icon: LucideIcon;
  id: string;
  imageSide?: "left" | "right";
  imageSrc?: string;
  title: string;
};
