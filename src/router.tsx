import { QueryClient, dehydrate, hydrate } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";

export const getRouter = () => {
  const queryClient = new QueryClient();

  const router = createRouter({
    routeTree,
    context: { queryClient },
    scrollRestoration: true,
    defaultPreloadStaleTime: 0,
    // Ship the server's query cache to the browser so the first client render
    // uses the same data the HTML was rendered with (no hydration mismatch,
    // no duplicate fetch on load).
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    dehydrate: (): any => ({ queryState: dehydrate(queryClient) }),
    hydrate: (dehydrated: { queryState: ReturnType<typeof dehydrate> }) => {
      hydrate(queryClient, dehydrated.queryState);
    },
  });

  return router;
};
