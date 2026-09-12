export type InstitutionalLoginAttempt = {
  loginAttemptId: string;
  nextStep: "PASSWORD" | "PASSKEY";
};
