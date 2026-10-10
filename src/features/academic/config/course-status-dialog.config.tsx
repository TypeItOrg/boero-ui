"use client";

import type { ReactNode } from "react";

import { GraduationCapIcon } from "lucide-react";

import type { CourseStatus } from "@features/academic/types/course-status.types";

export const COURSE_STATUS_DIALOG_CONFIG: Record<CourseStatus, CourseStatusDialogConfig> = {
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
  CLOSED: {
    actionLabel: "Finalizar curso",
    description: (resourceLabel) => (
      <>
        El curso <span className="text-foreground font-semibold">{resourceLabel}</span> se cerrará de forma definitiva y no podrá volver a editarse ni
        cambiar de estado. Se finalizarán sus cursadas y se liberarán los horarios. Los resultados ya registrados se conservarán; los demás quedarán
        pendientes de resultado. Las solicitudes de este curso pendientes o en lista de espera serán rechazadas y se quitará de los borradores.
      </>
    ),
    icon: GraduationCapIcon,
    iconClassName: "bg-destructive/10 text-destructive",
    pendingLabel: "Finalizando…",
    title: "Finalizar curso",
    variant: "destructive",
  },
};

export type CourseStatusDialogConfig = {
  actionLabel: string;
  description: (resourceLabel: string) => ReactNode;
  icon: typeof GraduationCapIcon;
  iconClassName: string;
  pendingLabel: string;
  title: string;
  variant: "default" | "destructive";
};
