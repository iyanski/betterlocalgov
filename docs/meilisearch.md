# Meilisearch Setup and Integration

This guide covers everything needed to run Meilisearch with betterlocalgov — from spinning up a server to keeping the content index current.

---

## Prerequisites

- Node.js 18+ (already required by the project)
- A running Meilisearch instance (local or cloud — see below)
- Project dependencies installed (`npm install`)

---

## Installing Meilisearch

### Option 1: Docker (recommended for local development)

```bash
docker run -d \
  --name meilisearch \
  -p 7700:7700 \
  -e MEILI_MASTER_KEY=your_master_key \
  getmeili/meilisearch:latest
```

Replace `your_master_key` with a strong string of your choice. This becomes the master key you use to generate API keys. Meilisearch is now reachable at `http://localhost:7700`.

### Option 2: Binary download

Download the latest binary for your platform from [https://github.com/meilisearch/meilisearch/releases](https://github.com/meilisearch/meilisearch/releases), then run:

```bash
./meilisearch --master-key your_master_key
```

### Option 3: Meilisearch Cloud

Create a free project at [https://cloud.meilisearch.com](https://cloud.meilisearch.com). After provisioning, the dashboard gives you:

- **Host URL** — your instance URL (e.g., `https://ms-xxxx.meilisearch.io`)
- **Default Admin API Key** — use this as `MEILISEARCH_ADMIN_KEY`
- **Default Search API Key** — use this as `VITE_MEILISEARCH_SEARCH_KEY`

No local server needed with this option.

---

## Configuring Environment Variables

Add the following to your `.env` file (copy from `.env.example` if it exists):

```dotenv
# Meilisearch server URL — no trailing slash
VITE_MEILISEARCH_HOST=http://localhost:7700

# Search-only key — safe to expose in the browser bundle
VITE_MEILISEARCH_SEARCH_KEY=your_search_only_key

# Admin key — used only by the indexing script, never exposed to the browser
MEILISEARCH_ADMIN_KEY=your_admin_key
```

### Getting the keys for a local instance

If you started Meilisearch with a master key, generate scoped API keys via the Keys API:

```bash
# List all generated keys
curl http://localhost:7700/keys \
  -H "Authorization: Bearer your_master_key"
```

Meilisearch auto-generates a **Default Admin API Key** and a **Default Search API Key** on first start. Copy those values into your `.env`.

Alternatively, use the master key itself as `MEILISEARCH_ADMIN_KEY` during local development — but never use the master key as `VITE_MEILISEARCH_SEARCH_KEY`.

### Key naming rules

| Variable                      | VITE\_ prefix | Exposed in browser | Purpose                          |
| ----------------------------- | ------------- | ------------------ | -------------------------------- |
| `VITE_MEILISEARCH_HOST`       | Yes           | Yes                | Client reads the server URL      |
| `VITE_MEILISEARCH_SEARCH_KEY` | Yes           | Yes                | Read-only search access          |
| `MEILISEARCH_ADMIN_KEY`       | No            | No                 | Write access for indexing script |

`MEILISEARCH_ADMIN_KEY` must not use the `VITE_` prefix. Vite inlines any `VITE_*` variable into the browser bundle at build time — an admin key in the bundle is a security hole.

---

## Indexing Your Content

Run the indexing script after your Meilisearch instance is up and your `.env` is configured:

```bash
npm run index-content
```

The script (`scripts/index-content.mjs`) does the following:

1. Crawls `content/services/**/*.md`, `content/government/**/*.md`, `content/hotlines/*.json` and `content/projects/*.json`, keeping only records that pass the shared visibility policy (`scripts/lib/visibility.mjs`), including the `national_applicable` source rule. `VITE_ALLOW_SOURCED_CONTENT` (or `ALLOW_SOURCED_CONTENT`, which takes precedence) controls sourced records, as in the app.
2. Extracts the page title (first `# Heading`) and description (first paragraph)
3. Strips all markdown syntax, leaving plain text for full-text search
4. Pushes documents to a Meilisearch index named `content`

Expected output on a successful run:

```
Indexed 12 documents to "content"
Task ID: 1 — status: enqueued
```

Meilisearch indexes asynchronously. The task will be processed within seconds; search results are available once the task status reaches `succeeded`.

### When to re-run

Re-run `npm run index-content` whenever you:

- Add or remove a markdown file under `content/`
- Edit the title or body of an existing markdown file
- Change the placeholder values in a companion `.json` file

---

## Using the Search Page

Navigate to `/search` in the running app. The search input is debounced — results update as you type without hammering the Meilisearch server.

### URL query state

The current query is synced to the URL via `nuqs`:

```
/search?q=building+permit
```

This means search queries are bookmarkable and shareable. Navigating back restores the previous query.

### Result cards

Each result card shows:

- **Title** — extracted from the first `# Heading` of the markdown file
- **Description** — extracted from the first paragraph
- **Badge** — `Service` (blue) for content under `content/services/`, `Government` (green) for content under `content/government/`
- A link to the full document page

---

## Keeping the Index Up to Date

The Meilisearch index is not updated automatically when markdown files change. You are responsible for re-running the indexing script after content updates.

### Suggested automation

**Git pre-commit hook** — add to `.husky/pre-commit` or `.git/hooks/pre-commit`:

```bash
npm run index-content
```

This ensures the index is refreshed before every commit that might include content changes.

**CI step** — add to your deployment pipeline after the build step:

```yaml
- name: Index content
  run: npm run index-content
  env:
    VITE_MEILISEARCH_HOST: ${{ secrets.VITE_MEILISEARCH_HOST }}
    MEILISEARCH_ADMIN_KEY: ${{ secrets.MEILISEARCH_ADMIN_KEY }}
```

The `VITE_MEILISEARCH_SEARCH_KEY` is not needed by the indexing script and can be omitted from CI secrets used only for indexing.

---

## Troubleshooting

**`ECONNREFUSED` or `fetch failed` when running `npm run index-content`**

Meilisearch is not running or is not reachable at `VITE_MEILISEARCH_HOST`. Confirm the server is up:

```bash
curl http://localhost:7700/health
# Expected: {"status":"available"}
```

If using Docker, check that the container is running: `docker ps | grep meilisearch`.

**`401 Unauthorized` from the indexing script**

`MEILISEARCH_ADMIN_KEY` is wrong or not set. Double-check the value in `.env` against the key shown in your Meilisearch dashboard or the `/keys` endpoint. The script needs write permission — a search-only key will not work here.

**Search page returns no results**

The index is empty or stale. Run `npm run index-content` and wait a few seconds for the indexing task to complete, then search again.

**Search page shows a network error in the browser console**

`VITE_MEILISEARCH_HOST` or `VITE_MEILISEARCH_SEARCH_KEY` is missing or incorrect. Both must be present at build time (or in `.env` for `vite dev`) because Vite inlines them. Restart the dev server after editing `.env`.

**Using the admin key as the search key**

This works technically but grants any browser visitor full write access to your Meilisearch instance. Always use a search-only key for `VITE_MEILISEARCH_SEARCH_KEY`. Generate one via the Meilisearch dashboard or the `/keys` API.
