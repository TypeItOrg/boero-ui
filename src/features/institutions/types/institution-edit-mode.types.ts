import { FORM_MODE } from "@common/types/form-mode.types";

import type { Institution } from "@features/institutions/types/institution.types";

export type EditMode = {
  mode: typeof FORM_MODE.EDIT;
  institution: Institution;
};
