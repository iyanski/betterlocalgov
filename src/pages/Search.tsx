import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { useQueryState } from 'nuqs';
import { Search as SearchIcon } from 'lucide-react';
import { searchClient, SEARCH_INDEX } from '../lib/meilisearch';
import type { SearchHit } from '../lib/meilisearch';
import VerificationBadge from '../components/content/VerificationBadge';

interface SearchState {
  query: string;
  results: SearchHit[];
  status: 'idle' | 'loading' | 'complete' | 'error';
}

export default function Search() {
  const [query, setQuery] = useQueryState('q', { defaultValue: '' });
  const normalizedQuery = query.trim();
  const [searchState, setSearchState] = useState<SearchState>({
    query: '',
    results: [],
    status: 'idle',
  });
  const currentState =
    searchState.query === normalizedQuery
      ? searchState
      : { query: normalizedQuery, results: [], status: 'idle' as const };
  const isLoading = currentState.status === 'loading';
  const hasSearched = currentState.status === 'complete';
  const error = currentState.status === 'error';

  useEffect(() => {
    if (!normalizedQuery) return;

    const timer = setTimeout(async () => {
      setSearchState({
        query: normalizedQuery,
        results: [],
        status: 'loading',
      });
      try {
        const index = searchClient!.index(SEARCH_INDEX);
        const res = await index.search<SearchHit>(normalizedQuery, {
          limit: 20,
        });
        setSearchState({
          query: normalizedQuery,
          results: res.hits,
          status: 'complete',
        });
      } catch {
        setSearchState({
          query: normalizedQuery,
          results: [],
          status: 'error',
        });
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [normalizedQuery]);

  return (
    <main className="container mx-auto px-4 py-8 max-w-3xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Search</h1>

      <div className="relative mb-8">
        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
        <input
          type="search"
          value={query}
          onChange={e => setQuery(e.target.value || null)}
          placeholder="Search services, departments, guides..."
          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          autoFocus
        />
      </div>

      {error && (
        <div className="text-center py-12 text-red-500 text-sm">
          Search is unavailable. Please try again later.
        </div>
      )}

      {!error && isLoading && (
        <div className="text-center py-12 text-gray-500 text-sm">
          Searching...
        </div>
      )}

      {!error &&
        !isLoading &&
        hasSearched &&
        currentState.results.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            No results for{' '}
            <span className="font-medium">&ldquo;{query}&rdquo;</span>
          </div>
        )}

      {!error && !isLoading && currentState.results.length > 0 && (
        <div className="space-y-3">
          <p className="text-sm text-gray-500 mb-4">
            {currentState.results.length} result
            {currentState.results.length !== 1 ? 's' : ''} for &ldquo;
            {normalizedQuery}&rdquo;
          </p>
          {currentState.results.map(hit => (
            <Link key={hit.id} to={hit.url} className="block group">
              <div className="border border-gray-200 rounded-lg p-4 hover:border-primary-300 hover:bg-primary-50 transition-colors">
                <div className="flex items-center gap-2 mb-2">
                  <span
                    className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                      hit.type === 'service'
                        ? 'bg-blue-100 text-blue-700'
                        : hit.type === 'hotline'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-green-100 text-green-700'
                    }`}
                  >
                    {hit.category}
                  </span>
                  <VerificationBadge status={hit.verificationStatus} />
                </div>
                <h2 className="text-base font-semibold text-gray-900 group-hover:text-primary-700">
                  {hit.title}
                </h2>
                {hit.description && (
                  <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                    {hit.description}
                  </p>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}

      {!normalizedQuery && !isLoading && !error && (
        <div className="text-center py-12 text-gray-400 text-sm">
          Start typing to search across services and government information
        </div>
      )}
    </main>
  );
}
