export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    await import('./sentry.server.config');
  }

  if (process.env.NEXT_RUNTIME === 'edge') {
    await import('./sentry.edge.config');
  }
}

export const onRequestError = async (
  err: Error,
  request: {
    path: string; // resource path, e.g. /blog?name=foo
    method: string; // request method. e.g. GET, POST, etc.
    headers: { [key: string]: string }; // request headers
  },
  context: {
    routerKind: 'Pages Router' | 'App Router'; // the router type
    routePath: string; // the route file path, e.g. /app/blog/[dynamic]
    routeType: 'render' | 'route' | 'action' | 'middleware'; // the context in which the error occurred
    renderSource:
      | 'react-server-components'
      | 'react-server-components-payload'
      | 'server-rendering';
    revalidateReason: 'on-demand' | 'stale' | undefined; // undefined is a normal request without revalidation
    rollbackReason:
      | 'parentNotFound' // The parent segment was not found in the generated tree
      | 'noGenerationRuntime' // The segment has no generation runtime (e.g. no generateStaticParams for dynamic rendering)
      | 'responseNotFound' // notFound() was thrown during generation
      | 'buildError' // An error occurred during generation
      | undefined; // No rollback occurred
  }
) => {
  const { routerKind, routePath, routeType } = context;
  console.error(`[Error] ${routerKind} - ${routePath} (${routeType}):`, err);
};
