export type PermissionAccess = {
  accessScope: "INSTITUTION" | "TRAINING_PATHS";
  trainingPathIds: readonly string[];
};
