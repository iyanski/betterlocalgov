import { Card, CardContent, CardHeader } from '@bettergov/kapwa/card';
import type { Subcategory } from '../../data/yamlLoader';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface BarangayProfile {
  punongBarangay?: string;
  telephone?: string;
}

interface BarangayCardsProps {
  title?: string;
  description?: string;
  pages: Subcategory[];
  showHeading?: boolean;
  source?: string;
}

interface BarangayEntry {
  slug: string;
  name: string;
  punongBarangay: string;
  telephone?: string;
}

const extractBarangayProfile = (content: string): BarangayProfile | null => {
  if (!content) return null;

  // Match "## Punong Barangay" section - name is on the same line as the bullet
  const punongMatch = content.match(
    /##\s+Punong Barangay\s*[\n\r]+[-*]\s+(.+?)(?:\n|$)/i
  );
  const telephoneMatch = content.match(
    /Barangay Telephone:\*\*\s+(.+?)(?:\n|$)/i
  );

  return {
    punongBarangay: punongMatch?.[1]?.trim(),
    telephone: telephoneMatch?.[1]?.trim(),
  };
};

/** Strips a leading "Barangay " label — the section heading already says
 * "Barangays", repeating it 42 times over reads as clutter. */
const shortName = (name: string) => name.replace(/^Barangay\s+/i, '');

const hasRealPhoneNumber = (telephone?: string) =>
  !!telephone && /\d{3,}/.test(telephone);

const generatedOnLabel = () =>
  new Date().toLocaleDateString('en-PH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

export default function BarangayCards({
  title,
  description,
  pages,
  showHeading = false,
  source,
}: BarangayCardsProps) {
  const navigate = useNavigate();
  const [barangayData, setBarangayData] = useState<
    Record<string, BarangayProfile>
  >({});
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');

  useEffect(() => {
    const loadBarangayData = async () => {
      const data: Record<string, BarangayProfile> = {};

      for (const page of pages) {
        try {
          const module = await import(
            `../../../content/government/barangays/${page.slug}.md?raw`
          );
          const content = module.default;
          const profile = extractBarangayProfile(content);
          if (profile) {
            data[page.slug] = profile;
          }
        } catch (error) {
          console.error(`Failed to load barangay ${page.slug}:`, error);
        }
      }

      setBarangayData(data);
      setLoading(false);
    };

    loadBarangayData();
  }, [pages]);

  const directory = useMemo<BarangayEntry[]>(
    () =>
      pages.map(page => {
        const profile = barangayData[page.slug] ?? {};
        return {
          slug: page.slug,
          name: shortName(page.name),
          punongBarangay: profile.punongBarangay || 'Loading data...',
          telephone: profile.telephone,
        };
      }),
    [pages, barangayData]
  );

  const filteredDirectory = useMemo(() => {
    const trimmed = query.trim().toLowerCase();
    if (!trimmed) return directory;
    return directory.filter(
      entry =>
        entry.name.toLowerCase().includes(trimmed) ||
        entry.punongBarangay.toLowerCase().includes(trimmed)
    );
  }, [directory, query]);

  if (loading) {
    return <div>Loading barangay information...</div>;
  }

  return (
    <div className="pb-4">
      {showHeading && (
        <div className="mb-8 max-w-3xl print:hidden">
          <p className="mb-2 text-sm font-semibold uppercase tracking-normal text-primary-700">
            Barangay Officials
          </p>
          {title && (
            <h1 className="text-3xl font-semibold text-slate-900 md:text-4xl">
              {title}
            </h1>
          )}
          {description && (
            <p className="mt-2 text-base leading-relaxed text-slate-600">
              {description}
            </p>
          )}
        </div>
      )}

      <div className="mb-6 flex flex-col gap-3 print:hidden sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <i
            className="ri-search-line pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            aria-hidden="true"
          />
          <label htmlFor="barangay-search" className="sr-only">
            Search barangays
          </label>
          <input
            id="barangay-search"
            type="search"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search by barangay or Punong Barangay…"
            className="w-full rounded-md border border-gray-300 py-2 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
        <div className="flex items-center justify-between gap-3 sm:justify-end">
          <p className="text-sm text-gray-500">
            {filteredDirectory.length} of {directory.length} barangays
          </p>
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex shrink-0 items-center gap-2 rounded-md border border-primary-200 bg-white px-3 py-2 text-sm font-medium text-primary-700 transition hover:border-primary-300 hover:bg-primary-50"
          >
            <i className="ri-printer-line" aria-hidden="true" />
            Print directory
          </button>
        </div>
      </div>

      {filteredDirectory.length === 0 ? (
        <p className="rounded-md border border-dashed border-gray-300 bg-gray-50 px-4 py-8 text-center text-sm text-gray-500 print:hidden">
          No barangays match &ldquo;{query}&rdquo;.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-5 print:hidden sm:grid-cols-2 lg:grid-cols-3">
          {filteredDirectory.map(entry => (
            <Card
              key={entry.slug}
              hoverable
              className="h-full border-primary-100 hover:bg-blue-50"
            >
              <CardContent className="flex h-full flex-col p-4">
                <h2 className="mb-3 text-xl font-semibold text-gray-900">
                  {entry.name}
                </h2>

                <div className="mb-3 space-y-2 text-sm text-gray-600">
                  <p>
                    <i
                      className="ri-user-3-line mr-1 text-primary-700"
                      aria-hidden="true"
                    />
                    <span className="font-medium text-gray-700">
                      Punong Barangay:
                    </span>{' '}
                    {entry.punongBarangay}
                  </p>
                  <p>
                    <i
                      className="ri-phone-line mr-1 text-primary-700"
                      aria-hidden="true"
                    />
                    <span className="font-medium text-gray-700">
                      Telephone:
                    </span>{' '}
                    {hasRealPhoneNumber(entry.telephone) ? (
                      <a
                        href={`tel:${entry.telephone}`}
                        className="break-all text-primary-700 hover:underline"
                      >
                        {entry.telephone}
                      </a>
                    ) : (
                      <span className="text-gray-400">
                        {entry.telephone || 'Not available'}
                      </span>
                    )}
                  </p>
                </div>

                <div className="mt-auto border-t border-gray-100 pt-4 text-sm">
                  <button
                    type="button"
                    className="inline-flex items-center gap-2 rounded-md border border-primary-200 bg-white px-3 py-2 font-medium text-primary-700 transition hover:border-primary-300 hover:bg-primary-50"
                    onClick={() => {
                      navigate(`/government/barangays/${entry.slug}`);
                    }}
                  >
                    View barangay profile
                    <i className="ri-arrow-right-line" aria-hidden="true" />
                  </button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {source && (
        <Card className="mt-8 border-primary-100 bg-gray-50 print:hidden">
          <CardHeader className="bg-stone-100">
            <h3 className="text-lg font-semibold text-gray-900">Source</h3>
          </CardHeader>
          <CardContent className="p-5">
            <p className="text-sm leading-relaxed text-gray-600">{source}</p>
          </CardContent>
        </Card>
      )}

      {/* Print-only view: always the full directory, regardless of the
          on-screen search filter, since the point of printing is a
          complete reference sheet. */}
      <div className="hidden print:block">
        <h1 className="text-xl font-bold text-black">
          Barangay Directory — Municipality of Aparri, Cagayan
        </h1>
        <p className="mb-4 text-xs text-gray-600">
          Generated on {generatedOnLabel()} · {directory.length} barangays ·
          betteraparri.org
        </p>
        <table className="w-full border-collapse text-sm text-black">
          <thead>
            <tr className="border-b-2 border-black text-left">
              <th className="py-1.5 pr-3">Barangay</th>
              <th className="py-1.5 pr-3">Punong Barangay</th>
              <th className="py-1.5">Telephone</th>
            </tr>
          </thead>
          <tbody>
            {directory.map(entry => (
              <tr key={entry.slug} className="border-b border-gray-300">
                <td className="py-1.5 pr-3 font-medium">{entry.name}</td>
                <td className="py-1.5 pr-3">{entry.punongBarangay}</td>
                <td className="py-1.5">
                  {hasRealPhoneNumber(entry.telephone)
                    ? entry.telephone
                    : 'Not available'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
