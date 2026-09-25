import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQueryState } from 'nuqs';
import Section from '../components/ui/Section';
import Breadcrumbs from '../components/ui/Breadcrumbs';
import { Heading } from '../components/ui/Heading';
import { Text } from '../components/ui/Text';
import { Card, CardContent } from '@bettergov/kapwa/card';
import SEO from '../components/SEO';

interface SearchEntry {
  id: number;
  title: string;
  description: string;
  url: string;
  section: string;
}

const sectionLabels: Record<string, string> = {
  services: 'Services',
  government: 'Government',
  transparency: 'Transparency',
  statistics: 'Statistics',
  updates: 'Updates',
};

/**
 * Small, dependency-free relevance scorer: no search server or
 * subscription required. Title matches score higher than description
 * matches; an exact word match scores higher than a substring match.
 */
function scoreEntry(entry: SearchEntry, terms: string[]): number {
  const title = entry.title.toLowerCase();
  const description = entry.description.toLowerCase();
  let score = 0;

  for (const term of terms) {
    if (!term) continue;

    const titleWords = title.split(/\W+/);
    if (titleWords.includes(term)) {
      score += 10;
    } else if (title.includes(term)) {
      score += 5;
    }

    if (description.includes(term)) {
      score += 1;
    }
  }

  return score;
}

function useSearchIndex() {
  const [entries, setEntries] = useState<SearchEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/search-index.json')
      .then(res => res.json())
      .then(setEntries)
      .catch(() => setEntries([]))
      .finally(() => setLoading(false));
  }, []);

  return { entries, loading };
}

const Search: React.FC = () => {
  const [query, setQuery] = useQueryState('q', { defaultValue: '' });
  const [inputValue, setInputValue] = useState(query);
  const { entries, loading } = useSearchIndex();

  useEffect(() => {
    setInputValue(query);
  }, [query]);

  const results = useMemo(() => {
    const trimmed = query.trim().toLowerCase();
    if (!trimmed) return [];

    const terms = trimmed.split(/\s+/);

    return entries
      .map(entry => ({ entry, score: scoreEntry(entry, terms) }))
      .filter(({ score }) => score > 0)
      .sort((a, b) => b.score - a.score)
      .map(({ entry }) => entry);
  }, [entries, query]);

  return (
    <>
      <SEO
        title="Search"
        description="Search Aparri services, government information, transparency data, and updates."
        keywords="search, Aparri, services, government, transparency"
        pageType="SearchResultsPage"
      />
      <Section className="p-3 mb-12">
        <Breadcrumbs className="mb-8" />
        <Heading className="mb-2">Search</Heading>
        <Text className="text-gray-600 mb-6">
          Search across services, government information, transparency data, and
          updates.
        </Text>

        <form
          role="search"
          onSubmit={e => {
            e.preventDefault();
            setQuery(inputValue);
          }}
          className="flex gap-2 mb-8"
        >
          <label htmlFor="site-search-input" className="sr-only">
            Search
          </label>
          <input
            id="site-search-input"
            type="search"
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
            placeholder="Search for a service, office, or update…"
            className="flex-1 rounded-md border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          <button
            type="submit"
            className="rounded-md bg-primary-500 px-5 py-2 font-medium text-white hover:bg-primary-600"
          >
            Search
          </button>
        </form>

        {loading ? (
          <Text>Loading search index…</Text>
        ) : !query.trim() ? (
          <Text className="text-gray-500">
            Type a search term above to get started.
          </Text>
        ) : results.length === 0 ? (
          <Text className="text-gray-500">
            No results for &ldquo;{query}&rdquo;. Try a different term.
          </Text>
        ) : (
          <div className="space-y-4">
            <Text className="text-sm text-gray-500">
              {results.length} result{results.length === 1 ? '' : 's'} for
              &ldquo;{query}&rdquo;
            </Text>
            {results.map(result => (
              <Link key={`${result.section}-${result.id}`} to={result.url}>
                <Card hoverable className="card-fade-in">
                  <CardContent>
                    <span className="inline-block px-2 py-1 mb-2 text-xs font-medium rounded-sm bg-gray-100 text-gray-800">
                      {sectionLabels[result.section] ?? result.section}
                    </span>
                    <h3 className="text-lg font-medium text-gray-900">
                      {result.title}
                    </h3>
                    {result.description && (
                      <p className="mt-1 text-sm text-gray-600">
                        {result.description}
                      </p>
                    )}
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </Section>
    </>
  );
};

export default Search;
