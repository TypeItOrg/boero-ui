"use client";

import Image from "next/image";
import { useState } from "react";
import { cn } from "@common/utils/cn.util";
import { useInstitutionalBrand } from "@features/institutional-auth/components/institutional-brand-context";
import { getInstitutionLogoUrl } from "@features/institutions/utils/institution-logo-url.util";

export function InstitutionalBrandIdentity({
  className,
  imageClassName,
  imageContainerClassName = "h-56 w-full",
  showInstitutionName = false,
}: {
  className?: string;
  imageClassName?: string;
  imageContainerClassName?: string;
  showInstitutionName?: boolean;
}): React.ReactElement {
  const institution = useInstitutionalBrand();
  const logoUrl = institution ? getInstitutionLogoUrl(institution.id, institution.logoUrl) : "/brand/boero-logo.webp";
  const [failedUrl, setFailedUrl] = useState<string>();
  const hasLogo = Boolean(logoUrl && failedUrl !== logoUrl);

  return (
    <div className={cn("flex min-w-0 flex-col items-center gap-3 text-center", className)}>
      {hasLogo && logoUrl ? (
        <div className={cn("relative flex items-center justify-center", imageContainerClassName)}>
          <Image
            preload
            unoptimized={Boolean(institution)}
            sizes="(max-width: 768px) 80px, 224px"
            width={institution ? 240 : 875}
            height={institution ? 240 : 1202}
            src={logoUrl}
            alt={institution ? `Logo de ${institution.name}` : "Logo de Boero"}
            className={cn("h-full w-full object-contain", imageClassName)}
            onError={() => setFailedUrl(logoUrl)}
          />
        </div>
      ) : null}
      {institution && (showInstitutionName || !hasLogo) ? (
        <p className="w-full text-lg leading-snug font-semibold break-words">{institution.name}</p>
      ) : null}
    </div>
  );
}

export function InstitutionalBrandPanel({ showInstitutionName = false }: { showInstitutionName?: boolean }): React.ReactElement {
  return (
    <section className="from-primary to-primary/80 text-primary-foreground relative hidden bg-linear-to-l p-8 md:flex md:items-center md:justify-center lg:p-12">
      <InstitutionalBrandIdentity className="w-full max-w-56" imageContainerClassName="h-56 w-full" showInstitutionName={showInstitutionName} />
    </section>
  );
}
