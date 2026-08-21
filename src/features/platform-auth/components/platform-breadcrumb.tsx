"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@common/components/ui/breadcrumb";

const ROUTE_LABELS: Readonly<Record<string, string>> = {
  institutions: "Instituciones",
  accounts: "Administradores",
  new: "Nuevo",
  people: "Usuarios",
  roles: "Roles",
  edit: "Editar",
  academic: "Académico",
  "academic-years": "Ciclos lectivos",
  "training-paths": "Trayectos formativos",
  "study-plans": "Planes de estudio",
  "academic-levels": "Niveles",
  spaces: "Espacios",
  prerequisites: "Correlatividades",
  "academic-spaces": "Espacios académicos",
  instruments: "Instrumentos",
};

type BreadcrumbSegment = {
  label: string;
  href?: string;
};

type PlatformBreadcrumbProps = {
  hiddenSegments?: readonly string[];
  segmentHrefs?: Readonly<Record<string, string>>;
  segmentLabels?: Readonly<Record<string, string>>;
};

const EMPTY_SEGMENT_LABELS: Readonly<Record<string, string>> = {};
const EMPTY_SEGMENTS: readonly string[] = [];

function getSegments(
  pathname: string,
  segmentLabels: Readonly<Record<string, string>>,
  segmentHrefs: Readonly<Record<string, string>>,
  hiddenSegments: readonly string[],
): BreadcrumbSegment[] {
  const withoutPlatform = pathname.replace(/^\/admin\/?/, "");
  const parts = withoutPlatform.split("/").filter(Boolean);

  if (parts.length === 0) {
    return [{ label: "Inicio" }];
  }

  const segments: BreadcrumbSegment[] = [{ label: "Inicio", href: "/admin" }];
  const hiddenSegmentSet = new Set(hiddenSegments);
  const visiblePartCount = parts.filter((part) => !hiddenSegmentSet.has(part)).length;

  let accumulatedPath = "/admin";
  let visiblePartIndex = 0;
  for (const part of parts) {
    accumulatedPath = `${accumulatedPath}/${part}`;
    if (hiddenSegmentSet.has(part)) continue;

    const isLast = visiblePartIndex === visiblePartCount - 1;
    const label = segmentLabels[part] ?? ROUTE_LABELS[part] ?? "Editar";

    segments.push({ label, href: isLast ? undefined : (segmentHrefs[part] ?? accumulatedPath) });
    visiblePartIndex += 1;
  }

  return segments;
}

export function PlatformBreadcrumb({ hiddenSegments = EMPTY_SEGMENTS, segmentHrefs, segmentLabels }: PlatformBreadcrumbProps): React.ReactElement {
  const pathname = usePathname();
  const segments = getSegments(pathname, segmentLabels ?? EMPTY_SEGMENT_LABELS, segmentHrefs ?? EMPTY_SEGMENT_LABELS, hiddenSegments);

  return (
    <Breadcrumb className="text-muted-foreground max-w-full min-w-0">
      <BreadcrumbList className="no-scrollbar min-w-0 flex-nowrap overflow-x-auto whitespace-nowrap">
        {segments.map((segment, index) => {
          const isLast = index === segments.length - 1;

          return (
            <React.Fragment key={index}>
              <BreadcrumbItem className="shrink-0">
                {isLast ? (
                  <BreadcrumbPage className="text-muted-foreground font-medium">{segment.label}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink asChild>
                    <Link href={segment.href!}>{segment.label}</Link>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
              {!isLast ? <BreadcrumbSeparator className="shrink-0" /> : null}
            </React.Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
