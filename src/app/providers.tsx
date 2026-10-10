"use client";

import { useState, type ReactElement, type ReactNode } from "react";

import { MutationCache, QueryCache, QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider as NextThemesProvider } from "next-themes";

import { Toaster } from "@common/components/ui/sonner";
import { isHttpResponseError } from "@common/utils/http-response-error.util";

import { getRedirectPath } from "@features/platform-auth/utils/platform-auth-paths.util";

export function Providers({ children }: { children: ReactNode }): ReactElement {
  const [queryClient] = useState(() => {
    function redirectOnUnauthorized(error: unknown): void {
      if (!isHttpResponseError(error, 401)) {
        return;
      }

      client.clear();

      const currentPath = window.location.pathname + window.location.search;

      const loginPath = window.location.pathname.startsWith("/admin") ? "/admin/auth/login" : "/auth/login";

      window.location.href = getRedirectPath(loginPath, currentPath);
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
    <NextThemesProvider
      attribute="class"
      defaultTheme="light"
      enableSystem
      disableTransitionOnChange
      scriptProps={{ type: typeof window === "undefined" ? "text/javascript" : "text/plain" }}
    >
      <QueryClientProvider client={queryClient}>
        {children}
        <Toaster />
      </QueryClientProvider>
    </NextThemesProvider>
  );
}
