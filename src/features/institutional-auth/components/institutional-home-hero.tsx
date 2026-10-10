import type { ReactElement } from "react";

import Image from "next/image";

import { Separator } from "@common/components/ui/separator";

import type { InstitutionalPerson } from "@features/institutional-auth/types/institutional-person.types";
import type { InstitutionalUser } from "@features/institutional-auth/types/institutional-user.types";

export function InstitutionalHomeHero({
  greeting,
  user,
  person,
  primaryRole,
}: {
  greeting: "Buenos días" | "Buenas tardes" | "Buenas noches";
  user: InstitutionalUser;
  person: InstitutionalPerson | null;
  primaryRole: string;
}): ReactElement {
  return (
    <header className="@container/home-hero relative flex h-56 min-w-0 items-center overflow-hidden shadow-sm @2xl/home-hero:h-64">
      <Image src="/images/institutional-header.webp" alt="" fill sizes="100vw" quality={90} preload className="object-cover object-center" />
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-linear-to-r from-black/80 via-black/60 to-black/25 sm:from-black/85 sm:via-black/60 sm:via-[65%] sm:to-black/15 sm:to-[90%] 2xl:from-black/85 2xl:via-black/50 2xl:via-[50%] 2xl:to-black/5 2xl:to-[100%] dark:bg-black/20"
      />
      <div aria-hidden="true" className="absolute inset-0 bg-linear-to-t from-black/20 via-transparent to-transparent dark:from-black/35" />
      <div className="relative flex max-w-3xl min-w-0 items-center gap-4 p-5 text-white @2xl/home-hero:p-6 @4xl/home-hero:p-8">
        <Image
          width={875}
          height={1202}
          src="/brand/boero-logo.webp"
          loading="eager"
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
  );
}
