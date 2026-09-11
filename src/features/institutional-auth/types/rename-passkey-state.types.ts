export type RenamePasskeyState = {
  error?: string;
  fieldErrors?: Partial<Record<"label", string>>;
  success?: boolean;
};
