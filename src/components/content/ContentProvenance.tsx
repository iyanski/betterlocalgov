import type { ContentProvenance as ContentProvenanceData } from '../../lib/markdownLoader';
import { ExternalLink, ShieldCheck, TriangleAlert } from 'lucide-react';
import {
  sourceTypeLabels,
  verificationStatusDetails,
} from '../../lib/contentGovernance';

interface ContentProvenanceProps {
  provenance?: ContentProvenanceData;
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat('en-PH', {
    dateStyle: 'long',
    timeZone: 'UTC',
  }).format(new Date(`${value}T00:00:00Z`));
}

export default function ContentProvenance({
  provenance,
}: ContentProvenanceProps) {
  if (!provenance) return null;

  const details = verificationStatusDetails[provenance.verificationStatus];
  const StatusIcon =
    provenance.verificationStatus === 'verified' ? ShieldCheck : TriangleAlert;

  return (
    <aside
      aria-label="Content verification"
      className={`mt-8 rounded-lg border p-5 text-sm ${details.className}`}
    >
      <div className="flex items-start gap-3">
        <StatusIcon className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
        <div>
          <p className="font-semibold">{details.label}</p>
          <p className="mt-1">{details.description}</p>
        </div>
      </div>
      <dl className="mt-4 grid gap-2 sm:grid-cols-2">
        {provenance.lastUpdatedAt && (
          <div>
            <dt className="inline font-medium">Last updated: </dt>
            <dd className="inline">
              <time dateTime={provenance.lastUpdatedAt}>
                {formatDate(provenance.lastUpdatedAt)}
              </time>
            </dd>
          </div>
        )}
        {provenance.lastVerifiedAt && (
          <div>
            <dt className="inline font-medium">Last verified: </dt>
            <dd className="inline">
              <time dateTime={provenance.lastVerifiedAt}>
                {formatDate(provenance.lastVerifiedAt)}
              </time>
            </dd>
          </div>
        )}
        {provenance.asOf && (
          <div>
            <dt className="inline font-medium">Information as of: </dt>
            <dd className="inline">
              <time dateTime={provenance.asOf}>
                {formatDate(provenance.asOf)}
              </time>
            </dd>
          </div>
        )}
      </dl>
      {provenance.sources.length > 0 && (
        <div className="mt-3">
          <p className="font-medium text-gray-900">
            {provenance.sources.length === 1 ? 'Source' : 'Sources'}
          </p>
          <ul className="mt-1 space-y-1">
            {provenance.sources.map(source => (
              <li key={`${source.organization}-${source.url}`}>
                <a
                  href={source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary-700 underline underline-offset-2 hover:text-primary-900"
                >
                  {source.title}{' '}
                  <ExternalLink
                    className="inline h-3.5 w-3.5"
                    aria-label="(opens in a new tab)"
                  />
                </a>{' '}
                <span>— {source.organization}</span>
                <span className="block text-xs">
                  {sourceTypeLabels[source.type]}
                </span>
                {source.publishedAt && (
                  <span className="block text-xs">
                    Source published:{' '}
                    <time dateTime={source.publishedAt}>
                      {formatDate(source.publishedAt)}
                    </time>
                  </span>
                )}
                {source.asOf && (
                  <span>
                    {' '}
                    (as of{' '}
                    <time dateTime={source.asOf}>
                      {formatDate(source.asOf)}
                    </time>
                    )
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </aside>
  );
}
