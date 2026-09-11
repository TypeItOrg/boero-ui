export type InstitutionalIdentifyResult = {
  loginAttemptId: string;
  nextStep: "PASSWORD" | "PASSKEY";
};
