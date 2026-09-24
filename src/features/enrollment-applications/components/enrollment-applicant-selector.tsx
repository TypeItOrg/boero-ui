import Link from "next/link";

import { Button } from "@common/components/ui/button";
import { ENROLLMENT_PAGE_PATH } from "@features/enrollment-applications/constants/enrollment-application.constants";

type EnrollmentApplicantSelectorProps = {
  dependents: { id: string; name: string }[];
  selectedId?: string;
};

export function EnrollmentApplicantSelector({ dependents, selectedId }: EnrollmentApplicantSelectorProps): React.ReactElement | null {
  if (dependents.length === 0) {
    return null;
  }

  return (
    <nav aria-label="Persona a inscribir" className="flex flex-wrap items-center gap-2">
      <ApplicantLink href={ENROLLMENT_PAGE_PATH} isCurrent={!selectedId} label="Inscribirme a mí mismo" />
      {dependents.map((dependent) => (
        <ApplicantLink
          href={`${ENROLLMENT_PAGE_PATH}?dependentId=${dependent.id}`}
          isCurrent={dependent.id === selectedId}
          key={dependent.id}
          label={dependent.name}
        />
      ))}
    </nav>
  );
}

function ApplicantLink({ href, isCurrent, label }: { href: string; isCurrent: boolean; label: string }): React.ReactElement {
  return (
    <Button asChild size="sm" variant={isCurrent ? "default" : "outline"}>
      <Link aria-current={isCurrent ? "true" : undefined} href={href}>
        {label}
      </Link>
    </Button>
  );
}
