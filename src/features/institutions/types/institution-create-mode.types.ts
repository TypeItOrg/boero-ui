import { FORM_MODE } from "@common/types/form-mode.types";

export type CreateMode = {
  mode: typeof FORM_MODE.CREATE;
  institution?: never;
};
