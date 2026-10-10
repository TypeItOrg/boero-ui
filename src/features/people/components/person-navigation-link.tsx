import { forwardRef, type ComponentProps, type ReactElement } from "react";

import Link from "next/link";

import { ReturnToLink } from "@common/components/navigation/return-to-link";

import { PeopleScope, type PeopleScope as PeopleScopeType } from "@features/people/utils/people-scope.util";

export const PersonNavigationLink = forwardRef<HTMLAnchorElement, PersonNavigationLinkProps>(function PersonNavigationLink(
  { href, children, returnTo, ...props },
  ref,
): ReactElement {
  const hrefString = typeof href === "string" ? href : (href.pathname ?? "");

  if (hrefString === "/account") {
    return (
      <Link ref={ref} href={href} {...props}>
        {children}
      </Link>
    );
  }

  return (
    <ReturnToLink ref={ref} href={hrefString} returnTo={returnTo} {...props}>
      {children}
    </ReturnToLink>
  );
});

export type PersonNavigationLinkProps = ComponentProps<typeof Link> & {
  returnTo?: string;
};

export function getPersonHref(
  scope: PeopleScopeType,
  institutionId: string,
  personId: string,
  selfPersonId?: string | null,
  detailView = false,
): string {
  if (PeopleScope.isInstitutional(scope) && personId === selfPersonId) {
    return "/account";
  }

  const personPath = PeopleScope.isInstitutional(scope) ? `/people/${personId}` : `/admin/institutions/${institutionId}/people/${personId}`;

  return detailView ? `${personPath}?view=detail` : personPath;
}
