"use client";

import { useState } from "react";
import { QueryClient, QueryClientProvider, QueryCache, MutationCache } from "@tanstack/react-query";

import { getRedirectPath } from "@features/platform-auth/utils/platform-auth-paths.util";

export function Providers({ children }: { children: React.ReactNode }): React.ReactElement {
  const [queryClient] = useState(() => {
    const client = new QueryClient({
      defaultOptions: {
        queries: {
          staleTime: 5 * 60 * 1000,
          refetchOnWindowFocus: false,
        },
      },
      queryCache: new QueryCache({
        onError: (error) => {
          const err = error as { status?: number; statusCode?: number; message?: string };
          if (err?.status === 401 || err?.statusCode === 401 || err?.message?.includes("401")) {
            client.clear();
            const currentPath = window.location.pathname + window.location.search;
            window.location.href = getRedirectPath("/auth/platform/login", currentPath);
          }
        },
      }),
      mutationCache: new MutationCache({
        onError: (error) => {
          const err = error as { status?: number; statusCode?: number; message?: string };
          if (err?.status === 401 || err?.statusCode === 401 || err?.message?.includes("401")) {
            client.clear();
            const currentPath = window.location.pathname + window.location.search;
            window.location.href = getRedirectPath("/auth/platform/login", currentPath);
          }
        },
      }),
    });
    return client;
  });

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
