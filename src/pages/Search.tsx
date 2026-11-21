import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { useQueryState } from 'nuqs';
import { Search as SearchIcon } from 'lucide-react';
import { searchClient, SEARCH_INDEX } from '../lib/meilisearch';
import type { SearchHit } from '../lib/meilisearch';
import Container from '../components/ui/Container';
import Badge from '../components/ui/Badge';
import Notice from '../components/ui/Notice';

export default function Search() {
  const [query, setQuery] = useQueryState('q', { defaultValue: '' });
  const [results, setResults] = useState<SearchHit[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setHasSearched(false);
      setError(null);
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoading(true);
      setError(null);
      try {
        const index = searchClient!.index(SEARCH_INDEX);
        const res = await index.search<SearchHit>(query, { limit: 20 });
        setResults(res.hits);
        setHasSearched(true);
      } catch {
        setError('Search is unavailable. Please try again later.');
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  return (
    <main className="flex-grow">
      <section className="bg-ed-navy-2 py-12 text-white md:py-16">
        <Container>
          <p className="eyebrow text-white/75">Search</p>
          <h1 className="mt-4 font-display text-[clamp(32px,5vw,56px)] font-bold leading-none tracking-[-0.02em] text-white">
            Find a service or office
          </h1>
          <div className="mt-8 flex max-w-2xl items-center border-[1.5px] border-white bg-ed-paper">
            <SearchIcon
              className="ml-4 h-5 w-5 shrink-0 text-ed-ink-4"
              aria-hidden
            />
            <input
              type="search"
              value={query}
              onChange={e => setQuery(e.target.value || null)}
              placeholder="Try: business permit"
              aria-label="Search services, departments, guides"
              className="min-w-0 flex-1 border-0 bg-transparent px-4 py-4 font-display text-xl text-ed-ink outline-none placeholder:italic placeholder:text-ed-ink-4 max-md:py-3 max-md:text-lg"
              autoFocus
            />
          </div>
        </Container>
      </section>

      <Container className="py-10">
        {error && <Notice title="Search unavailable" description={error} />}

        {!error && isLoading && (
          <p className="eyebrow py-12 text-center text-ed-ink-3">Searching…</p>
        )}

        {!error && !isLoading && hasSearched && results.length === 0 && (
          <p className="py-12 text-center text-ed-ink-2">
            No results for{' '}
            <span className="font-medium text-ed-ink">
              &ldquo;{query}&rdquo;
            </span>
          </p>
        )}

        {!error && !isLoading && results.length > 0 && (
          <>
            <p className="eyebrow mb-4 border-b border-ed-ink pb-3 text-ed-ink-3">
              {results.length} result{results.length !== 1 ? 's' : ''} for
              &ldquo;{query}&rdquo;
            </p>
            <div className="space-y-4">
              {results.map(hit => (
                <Link
                  key={hit.id}
                  to={hit.url}
                  className="group block border border-ed-rule bg-ed-paper p-6 no-underline transition-colors hover:border-ed-ink"
                >
                  <Badge variant={hit.type === 'service' ? 'navy' : 'neutral'}>
                    {hit.category}
                  </Badge>
                  <h2 className="mt-3 font-display text-xl font-semibold text-ed-ink group-hover:text-ed-navy">
                    {hit.title}
                  </h2>
                  {hit.description && (
                    <p className="mt-2 line-clamp-2 text-[15px] leading-relaxed text-ed-ink-2">
                      {hit.description}
                    </p>
                  )}
                </Link>
              ))}
            </div>
          </>
        )}

        {!hasSearched && !isLoading && !error && (
          <p className="py-12 text-center text-ed-ink-2">
            Start typing to search across services and government information.
          </p>
        )}
      </Container>
    </main>
  );
}
