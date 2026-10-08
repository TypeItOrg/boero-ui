import type { ReactElement } from "react";

import { QueryClient, QueryClientProvider, type DefaultOptions } from "@tanstack/react-query";
import { render, type RenderOptions, type RenderResult } from "@testing-library/react";

type RenderWithQueryClientResult = RenderResult & {
  queryClient: QueryClient;
};

const queryClients = new Set<QueryClient>();

afterEach(() => {
  for (const queryClient of queryClients) {
    queryClient.clear();
  }

  queryClients.clear();
});

export function createTestQueryClient(defaultOptions: DefaultOptions = {}): QueryClient {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: Infinity,
        ...defaultOptions.queries,
      },
      mutations: {
        retry: false,
        ...defaultOptions.mutations,
      },
    },
  });

  queryClients.add(queryClient);

  return queryClient;
}

export function renderWithQueryClient(ui: ReactElement, options?: Omit<RenderOptions, "wrapper">): RenderWithQueryClientResult {
  const queryClient = createTestQueryClient();
  const result = render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>, options);

  return {
    ...result,
    queryClient,
  };
}
