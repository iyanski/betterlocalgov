import { ExternalLink } from 'lucide-react';
import {
  foiChannelLabels,
  foiStatusLabels,
  type FoiRequest,
} from '../../lib/foiRequests';

function formatDate(value: string): string {
  return new Intl.DateTimeFormat('en-PH', {
    dateStyle: 'long',
    timeZone: 'UTC',
  }).format(new Date(`${value}T00:00:00Z`));
}

export default function FoiRequestsList({
  requests,
}: {
  requests: FoiRequest[];
}) {
  if (requests.length === 0) {
    return (
      <p className="text-gray-700">
        No request has been filed yet. Requests will be listed here after the
        maintainers send them.
      </p>
    );
  }

  return (
    <ul className="space-y-4">
      {requests.map(request => (
        <li
          key={request.id}
          className="rounded-lg border border-gray-200 bg-white p-5"
        >
          <h2 className="text-lg font-semibold text-gray-900">
            {request.subject}
          </h2>
          <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
            <div>
              <dt className="inline font-medium">Agency or office: </dt>
              <dd className="inline">{request.agency}</dd>
            </div>
            <div>
              <dt className="inline font-medium">Channel: </dt>
              <dd className="inline">{foiChannelLabels[request.channel]}</dd>
            </div>
            <div>
              <dt className="inline font-medium">Date sent: </dt>
              <dd className="inline">
                <time dateTime={request.dateSent}>
                  {formatDate(request.dateSent)}
                </time>
              </dd>
            </div>
            <div>
              <dt className="inline font-medium">Status: </dt>
              <dd className="inline">{foiStatusLabels[request.status]}</dd>
            </div>
            {request.responseDate && (
              <div>
                <dt className="inline font-medium">Response date: </dt>
                <dd className="inline">
                  <time dateTime={request.responseDate}>
                    {formatDate(request.responseDate)}
                  </time>
                </dd>
              </div>
            )}
          </dl>
          {request.publicRequestUrl && (
            <p className="mt-3 text-sm">
              <a
                href={request.publicRequestUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary-700 underline underline-offset-2 hover:text-primary-900"
              >
                Public eFOI request{' '}
                <ExternalLink
                  className="inline h-3.5 w-3.5"
                  aria-label="(opens in a new tab)"
                />
              </a>
            </p>
          )}
        </li>
      ))}
    </ul>
  );
}
