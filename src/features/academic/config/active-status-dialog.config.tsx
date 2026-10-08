"use client";

import type { ComponentType, ReactNode } from "react";

import { ClockIcon, GraduationCapIcon, LibraryBigIcon, Music2Icon, RouteIcon } from "lucide-react";

import { AcademicResource } from "@features/academic/types/academic-resource.types";
import type { ActiveAcademicStatusResource } from "@features/academic/types/active-academic-status-resource.types";
import { type ActiveStatus } from "@features/academic/types/active-academic-status.types";

export const ACTIVE_STATUS_DIALOG_CONFIG: Record<ActiveAcademicStatusResource, Record<ActiveStatus, ActiveStatusDialogConfig>> = {
  [AcademicResource.TRAINING_PATH]: {
    ACTIVE: {
      actionLabel: "Activar trayecto formativo",
      description: (resourceLabel) => (
        <>
          El trayecto formativo <span className="text-foreground font-semibold">{resourceLabel}</span> volverá a estar disponible para nuevas
          configuraciones.
        </>
      ),
      icon: RouteIcon,
      iconClassName: "bg-primary/10 text-primary",
      pendingLabel: "Activando…",
      title: "Activar trayecto formativo",
      variant: "default",
    },
    INACTIVE: {
      actionLabel: "Desactivar trayecto formativo",
      description: (resourceLabel) => (
        <>
          El trayecto formativo <span className="text-foreground font-semibold">{resourceLabel}</span> dejará de estar disponible para nuevas
          configuraciones.
        </>
      ),
      icon: RouteIcon,
      iconClassName: "bg-destructive/10 text-destructive",
      pendingLabel: "Desactivando…",
      title: "Desactivar trayecto formativo",
      variant: "destructive",
    },
  },
  [AcademicResource.ACADEMIC_SPACE]: {
    ACTIVE: {
      actionLabel: "Activar espacio académico",
      description: (resourceLabel) => (
        <>
          El espacio académico <span className="text-foreground font-semibold">{resourceLabel}</span> volverá a estar disponible para nuevas
          configuraciones curriculares.
        </>
      ),
      icon: LibraryBigIcon,
      iconClassName: "bg-primary/10 text-primary",
      pendingLabel: "Activando…",
      title: "Activar espacio académico",
      variant: "default",
    },
    INACTIVE: {
      actionLabel: "Desactivar espacio académico",
      description: (resourceLabel) => (
        <>
          El espacio académico <span className="text-foreground font-semibold">{resourceLabel}</span> dejará de estar disponible para nuevas
          configuraciones curriculares. No se podrá desactivar si está utilizado en un plan de estudio borrador o activo.
        </>
      ),
      icon: LibraryBigIcon,
      iconClassName: "bg-destructive/10 text-destructive",
      pendingLabel: "Desactivando…",
      title: "Desactivar espacio académico",
      variant: "destructive",
    },
  },
  [AcademicResource.INSTRUMENT]: {
    ACTIVE: {
      actionLabel: "Activar instrumento",
      description: (resourceLabel) => (
        <>
          El instrumento <span className="text-foreground font-semibold">{resourceLabel}</span> volverá a estar disponible para nuevas
          configuraciones.
        </>
      ),
      icon: Music2Icon,
      iconClassName: "bg-primary/10 text-primary",
      pendingLabel: "Activando…",
      title: "Activar instrumento",
      variant: "default",
    },
    INACTIVE: {
      actionLabel: "Desactivar instrumento",
      description: (resourceLabel) => (
        <>
          El instrumento <span className="text-foreground font-semibold">{resourceLabel}</span> dejará de estar disponible para nuevas
          configuraciones.
        </>
      ),
      icon: Music2Icon,
      iconClassName: "bg-destructive/10 text-destructive",
      pendingLabel: "Desactivando…",
      title: "Desactivar instrumento",
      variant: "destructive",
    },
  },
  [AcademicResource.COURSE]: {
    ACTIVE: {
      actionLabel: "Activar curso",
      description: (resourceLabel) => (
        <>
          El curso <span className="text-foreground font-semibold">{resourceLabel}</span> volverá a estar activo para la institución.
        </>
      ),
      icon: GraduationCapIcon,
      iconClassName: "bg-primary/10 text-primary",
      pendingLabel: "Activando…",
      title: "Activar curso",
      variant: "default",
    },
    INACTIVE: {
      actionLabel: "Desactivar curso",
      description: (resourceLabel) => (
        <>
          El curso <span className="text-foreground font-semibold">{resourceLabel}</span> dejará de estar activo. Los planes de estudio asociados no
          podrán desactivarse mientras tenga cursos activos.
        </>
      ),
      icon: GraduationCapIcon,
      iconClassName: "bg-destructive/10 text-destructive",
      pendingLabel: "Desactivando…",
      title: "Desactivar curso",
      variant: "destructive",
    },
  },
  [AcademicResource.SHIFT]: {
    ACTIVE: {
      actionLabel: "Activar turno",
      description: (resourceLabel) => (
        <>
          El turno <span className="text-foreground font-semibold">{resourceLabel}</span> volverá a estar disponible para nuevas configuraciones.
        </>
      ),
      icon: ClockIcon,
      iconClassName: "bg-primary/10 text-primary",
      pendingLabel: "Activando…",
      title: "Activar turno",
      variant: "default",
    },
    INACTIVE: {
      actionLabel: "Desactivar turno",
      description: (resourceLabel) => (
        <>
          El turno <span className="text-foreground font-semibold">{resourceLabel}</span> dejará de estar disponible para nuevas configuraciones.
        </>
      ),
      icon: ClockIcon,
      iconClassName: "bg-destructive/10 text-destructive",
      pendingLabel: "Desactivando…",
      title: "Desactivar turno",
      variant: "destructive",
    },
  },
};

export type ActiveStatusDialogConfig = {
  actionLabel: string;
  description: (resourceLabel: string) => ReactNode;
  icon: ComponentType<{ className?: string }>;
  iconClassName: string;
  pendingLabel: string;
  title: string;
  variant: "default" | "destructive";
};
