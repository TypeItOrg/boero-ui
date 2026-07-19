"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@common/components/ui/breadcrumb";

const SEGMENT_LABELS: Readonly<Record<string, string>> = {
  people: "Usuarios",
  new: "Nuevo usuario",
  profile: "Perfil",
  edit: "Editar",
  roles: "Roles",
};

type BreadcrumbSegment = {
  label: string;
  href?: string;
};

type InstitutionalBreadcrumbProps = {
  segmentLabels?: Readonly<Record<string, string>>;
};

const EMPTY_SEGMENT_LABELS: Readonly<Record<string, string>> = {};

export function InstitutionalBreadcrumb({
  segmentLabels = EMPTY_SEGMENT_LABELS,
}: InstitutionalBreadcrumbProps): React.ReactElement {
  const pathname = usePathname();
  const segments = getSegments(pathname, segmentLabels);

  return (
    <Breadcrumb className="text-muted-foreground max-w-full min-w-0">
      <BreadcrumbList className="no-scrollbar min-w-0 flex-nowrap overflow-x-auto whitespace-nowrap">
        {segments.map((segment, index) => {
          const isLast = index === segments.length - 1;

          return (
            <React.Fragment key={segment.href ?? segment.label}>
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

function getSegments(pathname: string, customSegmentLabels: Readonly<Record<string, string>>): BreadcrumbSegment[] {
  const parts = pathname.split("/").filter(Boolean);
  const segments: BreadcrumbSegment[] = [{ label: "Inicio", href: "/" }];
  let accumulatedPath = "";

  for (const [index, part] of parts.entries()) {
    accumulatedPath = `${accumulatedPath}/${part}`;
    const isLast = index === parts.length - 1;
    const label = customSegmentLabels[part] ?? SEGMENT_LABELS[part] ?? "Editar";

    segments.push({
      label,
      href: isLast ? undefined : accumulatedPath,
    });
  }

  return segments;
}
