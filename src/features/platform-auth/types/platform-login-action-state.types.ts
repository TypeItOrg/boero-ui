export type PlatformLoginActionState = {
  error?: string;
  fieldErrors?: {
    email?: string;
    password?: string;
  };
};
