"use client";

import { useState, type ReactElement } from "react";

import Image from "next/image";

import { ImageIcon } from "lucide-react";

import { SectionHeader } from "@common/components/section-header";
import { cn } from "@common/utils/cn.util";

import { INSTITUTION_ERROR_MESSAGES } from "@features/institutions/constants/error-messages.constants";
import { getInstitutionLogoUrl } from "@features/institutions/utils/institution-logo-url.util";

type InstitutionLogoManagerProps = {
  institutionId: string;
  institutionName: string;
  logoUrl: string | null;
  scope?: "platform" | "institutional";
  canUpdate?: boolean;
};

export function InstitutionLogoManager({ institutionId, institutionName, logoUrl }: InstitutionLogoManagerProps): ReactElement {
  const currentUrl = getInstitutionLogoUrl(institutionId, logoUrl);

  return (
    <section className="bg-muted/25 rounded-xl border p-4 sm:p-5">
      <header className="-mx-4 border-b px-4 pb-4 sm:-mx-5 sm:px-5 sm:pb-5">
        <SectionHeader icon={ImageIcon} title="Logo institucional" description="Identidad visible en el acceso público de la institución." />
      </header>
      <div className="bg-background mt-5 flex min-h-32 items-center justify-center rounded-lg border p-4">
        {currentUrl ? (
          <InstitutionLogoImage src={currentUrl} alt={`Logo de ${institutionName}`} className="h-auto max-h-40 w-auto max-w-full object-contain" />
        ) : (
          <p className="text-muted-foreground text-sm">Sin logo. Se mostrará el nombre de la institución.</p>
        )}
      </div>
    </section>
  );
}

export function InstitutionLogoImage({
  src,
  alt,
  className,
  compact = false,
}: {
  src: string;
  alt: string;
  className?: string;
  compact?: boolean;
}): ReactElement {
  const [failedUrl, setFailedUrl] = useState<string>();

  if (failedUrl === src) {
    return (
      <div
        role="img"
        aria-label={INSTITUTION_ERROR_MESSAGES.PREVIEW_UNAVAILABLE}
        className={cn("text-muted-foreground flex items-center justify-center gap-2", className)}
      >
        <ImageIcon aria-hidden="true" className="size-5 shrink-0" />
        {!compact ? <span className="text-sm">{INSTITUTION_ERROR_MESSAGES.PREVIEW_UNAVAILABLE}</span> : null}
      </div>
    );
  }

  return <Image unoptimized src={src} alt={alt} width={240} height={160} className={className} onError={() => setFailedUrl(src)} />;
}
