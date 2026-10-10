"use client";

import type { ReactElement, ReactNode } from "react";

import { type LucideIcon } from "lucide-react";

import { OptionalValue } from "@common/components/optional-value";
import { Card, CardContent } from "@common/components/ui/card";
import { DETAIL_LABEL_CLASS_NAME } from "@common/constants/detail-label.constants";
import { cn } from "@common/utils/cn.util";

import { EnrollmentStepCardHeader } from "@features/enrollment-applications/components/enrollment-step-card-header";

export function DetailCard({ children, className, description, icon, title }: DetailCardProps): ReactElement {
  return (
    <Card className={cn(SECTION_CARD_CLASS_NAME, className)}>
      <EnrollmentStepCardHeader icon={icon} title={title} description={description} descriptionBreakpoint="sm" />
      <CardContent>{children}</CardContent>
    </Card>
  );
}

export function DetailItem({ className, label, value, fallback = "Sin información" }: DetailItemProps): ReactElement {
  return (
    <div className={cn("min-w-0 space-y-1", className)}>
      <dt className={DETAIL_LABEL_CLASS_NAME}>{label}</dt>
      <dd className="text-foreground text-sm font-medium break-words">
        <OptionalValue value={value} fallback={fallback} />
      </dd>
    </div>
  );
}

export type DetailCardProps = {
  children: ReactNode;
  className?: string;
  description: string;
  icon: LucideIcon;
  title: string;
};

export type DetailItemProps = {
  className?: string;
  label: string;
  value: ReactNode;
  fallback?: string;
};

export const SECTION_CARD_CLASS_NAME = "bg-muted/25 sm:[--card-spacing:--spacing(6)]";
