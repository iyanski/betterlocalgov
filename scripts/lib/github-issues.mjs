/**
 * Creates or updates a single issue per title using the default GITHUB_TOKEN.
 * `fetchImpl` is injectable for tests.
 */
export async function upsertIssue(
  {
    repo,
    token,
    title,
    body,
    labels = [],
    closeWhenResolved = false,
    resolved = false,
  },
  fetchImpl = fetch
) {
  const api = async (path, init = {}) => {
    const response = await fetchImpl(
      `https://api.github.com/repos/${repo}${path}`,
      {
        ...init,
        headers: {
          accept: 'application/vnd.github+json',
          authorization: `Bearer ${token}`,
          'x-github-api-version': '2022-11-28',
          'content-type': 'application/json',
        },
      }
    );
    if (!response.ok && response.status !== 422) {
      throw new Error(
        `GitHub API ${init.method ?? 'GET'} ${path} failed: ${response.status}`
      );
    }
    return response;
  };

  for (const label of labels) {
    await api('/labels', {
      method: 'POST',
      body: JSON.stringify({ name: label }),
    });
  }

  const query = new URLSearchParams({ state: 'open', per_page: '100' });
  if (labels[0]) query.set('labels', labels[0]);
  const open = await (await api(`/issues?${query}`)).json();
  const existing = open.find(
    issue => !issue.pull_request && issue.title === title
  );

  if (existing) {
    if (closeWhenResolved && resolved) {
      await api(`/issues/${existing.number}`, {
        method: 'PATCH',
        body: JSON.stringify({ body, state: 'closed' }),
      });
      return { action: 'closed', number: existing.number };
    }
    await api(`/issues/${existing.number}`, {
      method: 'PATCH',
      body: JSON.stringify({ body }),
    });
    return { action: 'updated', number: existing.number };
  }

  if (closeWhenResolved && resolved) return { action: 'none' };
  const created = await (
    await api('/issues', {
      method: 'POST',
      body: JSON.stringify({ title, body, labels }),
    })
  ).json();
  return { action: 'created', number: created.number };
}
