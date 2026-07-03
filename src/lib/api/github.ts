/**
 * GitHub activity wrapper. Public events need no key (60 req/h unauthenticated);
 * the MVP ships demo data on the Command Center card, with this typed fetcher
 * ready for a live toggle in v2 (add GITHUB_TOKEN to raise rate limits).
 */

export interface GitHubEvent {
  type: string;
  repo: string;
  detail: string;
  when: string;
}

export async function fetchPublicEvents(username: string): Promise<GitHubEvent[]> {
  const res = await fetch(`https://api.github.com/users/${username}/events/public`, {
    headers: { Accept: "application/vnd.github+json" },
  });
  if (!res.ok) throw new Error(`GitHub API error (${res.status})`);
  const events = (await res.json()) as {
    type: string;
    repo: { name: string };
    created_at: string;
    payload: { commits?: unknown[]; action?: string };
  }[];
  return events.slice(0, 8).map((e) => ({
    type: e.type,
    repo: e.repo.name.split("/")[1] ?? e.repo.name,
    detail:
      e.type === "PushEvent"
        ? `${e.payload.commits?.length ?? 0} commit(s)`
        : e.payload.action ?? e.type,
    when: new Date(e.created_at).toLocaleDateString(),
  }));
}
