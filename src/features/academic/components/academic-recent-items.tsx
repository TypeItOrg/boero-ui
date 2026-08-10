import { Fragment } from "react";
import Link from "next/link";
import { ChevronRightIcon, HistoryIcon } from "lucide-react";

import { Badge } from "@common/components/ui/badge";
import { Separator } from "@common/components/ui/separator";
import { ACADEMIC_RESOURCE_ICONS } from "@features/academic/config/academic-resource-icons.config";
import type { AcademicRecentItem } from "@features/academic/services/academic-recent.service";

type AcademicRecentItemsProps = {
  basePath: string;
  items: AcademicRecentItem[];
};

export function AcademicRecentItems({ basePath, items }: AcademicRecentItemsProps): React.ReactElement {
  return (
    <section aria-labelledby="academic-recent-title" className="border-t pt-5">
      <div>
        <h2 id="academic-recent-title" className="text-base font-semibold">
          Actividad reciente
        </h2>
        <p className="text-muted-foreground mt-1 text-sm">Los últimos registros incorporados.</p>
      </div>
      {items.length === 0 ? (
        <div className="bg-muted/25 mt-4 flex items-center gap-3 rounded-xl border p-4">
          <span className="bg-background text-muted-foreground flex min-h-10 w-10 shrink-0 items-center justify-center self-stretch rounded-lg border shadow-xs">
            <HistoryIcon aria-hidden="true" className="size-5" />
          </span>
          <div>
            <p className="font-medium">Todavía no hay actividad académica</p>
            <p className="text-muted-foreground mt-0.5 text-sm">Los nuevos registros aparecerán en este espacio.</p>
          </div>
        </div>
      ) : (
        <div className="bg-muted/25 mt-4 flex flex-col rounded-xl border px-4">
          {items.map((item, index) => (
            <Fragment key={item.resource}>
              {index > 0 ? <Separator /> : null}
              <RecentItemRow basePath={basePath} item={item} />
            </Fragment>
          ))}
        </div>
      )}
    </section>
  );
}

function RecentItemRow({ basePath, item }: { basePath: string; item: AcademicRecentItem }): React.ReactElement {
  const Icon = ACADEMIC_RESOURCE_ICONS[item.resource];
  return (
    <Link
      href={`${basePath}/${item.resource}/${item.id}`}
      className="hover:bg-muted/50 -mx-2 flex min-w-0 items-center gap-3 rounded-lg px-2 py-3.5 transition-colors"
    >
      <div className="bg-muted text-muted-foreground flex min-h-10 w-10 shrink-0 items-center justify-center self-stretch rounded-lg">
        <Icon className="size-4" aria-hidden="true" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-muted-foreground text-xs">{item.section}</p>
        <div className="mt-0.5 flex min-w-0 items-center gap-2">
          <p className="truncate font-medium">{item.label}</p>
          <Badge variant={item.active ? "success" : "secondary"}>{item.detail}</Badge>
        </div>
      </div>
      <ChevronRightIcon className="text-muted-foreground size-4 shrink-0" aria-hidden="true" />
    </Link>
  );
}
