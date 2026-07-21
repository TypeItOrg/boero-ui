"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import type { ComponentProps, ReactElement } from "react";

import { appendReturnTo } from "@common/utils/return-to.util";

export type ReturnToLinkProps = Omit<ComponentProps<typeof Link>, "href"> & {
  href: string;
  returnTo?: string;
};

export const ReturnToLink = React.forwardRef<HTMLAnchorElement, ReturnToLinkProps>(
  function ReturnToLink({ href, returnTo, ...props }, ref): ReactElement {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const currentPath = returnTo ?? getCurrentPath(pathname, searchParams.toString());

    return <Link ref={ref} href={appendReturnTo(href, currentPath)} {...props} />;
  }
);

ReturnToLink.displayName = "ReturnToLink";

function getCurrentPath(pathname: string, queryString: string): string {
  return queryString ? `${pathname}?${queryString}` : pathname;
}
