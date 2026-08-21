import { InstitutionalProfileForm } from "@features/institutional-auth/components/institutional-profile-form";
import { InstitutionalProfileSummary } from "@features/institutional-auth/components/institutional-profile-summary";
import type { InstitutionalPerson } from "@features/institutional-auth/types/institutional-person.types";

export { InstitutionalProfileForm };

type InstitutionalProfileProps = {
  person: InstitutionalPerson;
};

export function InstitutionalProfile({ person }: InstitutionalProfileProps): React.ReactElement {
  return <InstitutionalProfileSummary person={person} />;
}
