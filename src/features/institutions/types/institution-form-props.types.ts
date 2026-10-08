import { type CreateMode } from "@features/institutions/types/institution-create-mode.types";
import { type EditMode } from "@features/institutions/types/institution-edit-mode.types";

export type InstitutionFormProps = (CreateMode | EditMode) & {
  returnTo?: string;
  baseDomain?: string;
};
