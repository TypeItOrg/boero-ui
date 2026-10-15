export const GUARDIAN_WORKSPACE_COOKIE = "institutional_guardian_workspace";
export const GUARDIAN_WORKSPACE_MAX_AGE = 60 * 60 * 24 * 30;

export const GUARDIAN_WORKSPACE_MESSAGES = {
  INVALID_DEPENDENT: "La persona seleccionada ya no está a tu cargo.",
  UNAVAILABLE: "No se pudo cambiar la persona a cargo activa.",
} as const;
