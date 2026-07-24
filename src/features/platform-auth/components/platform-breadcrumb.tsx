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

type RouteConfig = {
  label: string;
};

const ROUTE_CONFIGS: Record<string, RouteConfig> = {
  institutions: {
    label: "Instituciones",
  },
  accounts: {
    label: "Administradores",
  },
  new: {
    label: "Nuevo",
  },
  people: {
    label: "Usuarios",
  },
  roles: {
    label: "Roles",
  },
  edit: {
    label: "Editar",
  },
};

type BreadcrumbSegment = {
  label: string;
  href?: string;
};

type PlatformBreadcrumbProps = {
  segmentLabels?: Readonly<Record<string, string>>;
};

const EMPTY_SEGMENT_LABELS: Readonly<Record<string, string>> = {};

function getSegments(pathname: string, segmentLabels: Readonly<Record<string, string>>): BreadcrumbSegment[] {
  const withoutPlatform = pathname.replace(/^\/admin\/?/, "");
  const parts = withoutPlatform.split("/").filter(Boolean);

  if (parts.length === 0) {
    return [{ label: "Inicio" }];
  }

  const segments: BreadcrumbSegment[] = [{ label: "Inicio", href: "/admin" }];

  let accumulatedPath = "/admin";
  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];
    accumulatedPath = `${accumulatedPath}/${part}`;
    const isLast = i === parts.length - 1;

    const config = ROUTE_CONFIGS[part];
    const label = segmentLabels[part] ?? config?.label ?? "Editar";

    if (isLast) {
      segments.push({ label });
    } else {
      segments.push({ label, href: accumulatedPath });
    }
  }

  return segments;
}

export function PlatformBreadcrumb({ segmentLabels }: PlatformBreadcrumbProps): React.ReactElement {
  const pathname = usePathname();
  const segments = getSegments(pathname, segmentLabels ?? EMPTY_SEGMENT_LABELS);

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
              {!isLast && <BreadcrumbSeparator className="shrink-0" />}
            </React.Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
