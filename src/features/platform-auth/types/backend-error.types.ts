export type BackendError = {
  status: number;
  message: string;
  fieldErrors?: Record<string, string>;
};
