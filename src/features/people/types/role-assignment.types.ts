export type RoleAssignment = {
  roleId: string;
  accessScope: "INSTITUTION" | "TRAINING_PATHS";
  trainingPathIds: string[];
};
