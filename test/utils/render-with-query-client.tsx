import type { ReactElement } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, type RenderOptions, type RenderResult } from "@testing-library/react";

type RenderWithQueryClientResult = RenderResult & {
  queryClient: QueryClient;
};

export function createTestQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: Infinity,
      },
      mutations: {
        retry: false,
      },
    },
  });
}

export function renderWithQueryClient(
  ui: ReactElement,
  options?: Omit<RenderOptions, "wrapper">,
): RenderWithQueryClientResult {
  const queryClient = createTestQueryClient();
  const result = render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>, options);

  return {
    ...result,
    queryClient,
  };
}
