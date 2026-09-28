import Link from "next/link";

import { Button } from "@common/components/ui/button";
import { ENROLLMENT_PAGE_PATH } from "@features/enrollment-applications/constants/enrollment-application.constants";

type EnrollmentApplicantSelectorProps = {
  allLabel?: string;
  /** Hide the "myself" option, e.g. for guardians who can only apply for their dependents. */
  hideSelf?: boolean;
  basePath?: string;
  paramName?: string;
  dependents: { id: string; name: string }[];
  selectedId?: string;
};

export function EnrollmentApplicantSelector({
  allLabel = "Inscribirme a mí mismo",
  basePath = ENROLLMENT_PAGE_PATH,
  dependents,
  hideSelf = false,
  paramName = "dependentId",
  selectedId,
}: EnrollmentApplicantSelectorProps): React.ReactElement | null {
  if (dependents.length === 0) {
    return null;
  }

  return (
    <nav aria-label="Persona a inscribir" className="flex flex-wrap items-center gap-2">
      {!hideSelf && <ApplicantLink href={basePath} isCurrent={!selectedId} label={allLabel} />}
      {dependents.map((dependent) => (
        <ApplicantLink
          href={`${basePath}?${paramName}=${dependent.id}`}
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
