import type { ReactElement } from "react";

import { GlobeIcon } from "lucide-react";

import { SectionHeader } from "@common/components/section-header";
import { Badge } from "@common/components/ui/badge";
import { DETAIL_LABEL_CLASS_NAME } from "@common/constants/detail-label.constants";

export function InstitutionPublicAccessDetail({ publicSubdomain, baseDomain }: { publicSubdomain: string | null; baseDomain: string }): ReactElement {
  const enabled = Boolean(publicSubdomain && baseDomain);

  return (
    <section className="bg-muted/25 min-w-0 rounded-xl border p-4 sm:p-5">
      <header className="-mx-4 border-b px-4 pb-4 sm:-mx-5 sm:px-5 sm:pb-5">
        <SectionHeader icon={GlobeIcon} title="Acceso público institucional" description="Subdominio para ingresar al portal de la institución." />
      </header>
      <div className="mt-5 flex flex-wrap items-start justify-between gap-4">
        <dl className="min-w-0">
          <dt className={DETAIL_LABEL_CLASS_NAME}>Subdominio</dt>
          <dd className="text-foreground mt-2 font-mono text-base font-medium break-all">
            {publicSubdomain || "Sin configurar"}
            {publicSubdomain && baseDomain ? <span className="text-muted-foreground font-normal">.{baseDomain}</span> : null}
          </dd>
        </dl>
        <Badge variant={enabled ? "success" : "secondary"}>{enabled ? "Habilitado" : "Deshabilitado"}</Badge>
      </div>
    </section>
  );
}
