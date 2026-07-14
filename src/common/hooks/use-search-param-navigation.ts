"use client";

import { useCallback } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

type NavigateOptions = {
  scroll?: boolean;
  replace?: boolean;
};

type UseSearchParamNavigation = {
  navigate: (updates: Record<string, string | undefined>, options?: NavigateOptions) => void;
};

export function useSearchParamNavigation(): UseSearchParamNavigation {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const navigate = useCallback(
    (updates: Record<string, string | undefined>, options?: NavigateOptions): void => {
      const params = new URLSearchParams(searchParams.toString());

      for (const [key, value] of Object.entries(updates)) {
        if (value === undefined) {
          params.delete(key);
        } else {
          params.set(key, value);
        }
      }

      const url = `${pathname}?${params.toString()}`;

      if (options?.replace) {
        router.replace(url, { scroll: options.scroll ?? false });
      } else {
        router.push(url, { scroll: options?.scroll ?? false });
      }
    },
    [pathname, router, searchParams],
  );

  return { navigate };
}
