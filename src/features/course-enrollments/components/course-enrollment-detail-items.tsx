import type { ReactElement, ReactNode } from "react";

import { type LucideIcon } from "lucide-react";

import { SectionHeader as SharedSectionHeader } from "@common/components/section-header";
import { DETAIL_LABEL_CLASS_NAME } from "@common/constants/detail-label.constants";

export function SectionHeader({
  id,
  icon: Icon,
  title,
  description,
}: {
  id: string;
  icon: LucideIcon;
  title: string;
  description: string;
}): ReactElement {
  return (
    <header className="-mx-5 border-b px-5 pb-5 md:-mx-6 md:px-6">
      <SharedSectionHeader icon={Icon} title={title} description={description} titleId={id} />
    </header>
  );
}

export function Detail({ label, value }: { label: string; value: ReactNode }): ReactElement {
  return (
    <div className="min-w-0">
      <dt className={DETAIL_LABEL_CLASS_NAME}>{label}</dt>
      <dd className="mt-1 font-semibold break-words">{value}</dd>
    </div>
  );
}
