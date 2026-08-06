/**
 * Wraps a Prisma call used by a statically-generated page (no dynamic
 * params to gate it) so a Docker image build — which has no database to
 * talk to, since the `db` service only exists at container runtime — degrades
 * to the fallback value instead of failing `next build`. The real data
 * shows up on first request once the container is actually running, via
 * ISR (`revalidate`) same as any other cached page.
 */
export async function safeBuildTimeFetch<T>(fn: () => Promise<T>, fallback: T, label: string): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    console.warn(`[safeBuildTimeFetch] ${label} failed (expected if the DB is unreachable at build time):`, error);
    return fallback;
  }
}
