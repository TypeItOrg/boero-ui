"use client";

import { useState } from "react";
import { QueryClient, QueryClientProvider, QueryCache, MutationCache } from "@tanstack/react-query";
import { ThemeProvider as NextThemesProvider } from "next-themes";

import { isHttpResponseError } from "@common/utils/http-response-error.util";
import { getRedirectPath } from "@features/platform-auth/utils/platform-auth-paths.util";

export function Providers({ children }: { children: React.ReactNode }): React.ReactElement {
  const [queryClient] = useState(() => {
    function redirectOnUnauthorized(error: unknown): void {
      if (!isHttpResponseError(error, 401)) return;

      client.clear();
      const currentPath = window.location.pathname + window.location.search;
      window.location.href = getRedirectPath("/admin/auth/login", currentPath);
    }

    const client = new QueryClient({
      defaultOptions: {
        queries: {
          staleTime: 5 * 60 * 1000,
          refetchOnWindowFocus: false,
        },
      },
      queryCache: new QueryCache({
        onError: redirectOnUnauthorized,
      }),
      mutationCache: new MutationCache({
        onError: redirectOnUnauthorized,
      }),
    });
    return client;
  });

  return (
    <NextThemesProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </NextThemesProvider>
  );
}
