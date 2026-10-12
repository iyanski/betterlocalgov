import { actionLabel, type WhatsNewEntry } from '../../lib/whatsNew';

function formatDate(value: string): string {
  return new Intl.DateTimeFormat('en-PH', {
    dateStyle: 'long',
    timeZone: 'UTC',
  }).format(new Date(`${value}T00:00:00Z`));
}

export default function WhatsNewList({
  entries,
}: {
  entries: WhatsNewEntry[];
}) {
  if (entries.length === 0) {
    return <p className="text-gray-700">No recent changes to list.</p>;
  }

  return (
    <ul className="divide-y divide-gray-200 rounded-lg border border-gray-200 bg-white">
      {entries.map((entry, index) => (
        <li key={`${entry.contentId}-${index}`} className="p-4">
          <time dateTime={entry.date} className="text-sm text-gray-600">
            {formatDate(entry.date)}
          </time>
          <p className="mt-1">
            <span className="font-medium">{actionLabel(entry.action)}: </span>
            <a
              href={entry.path}
              className="text-primary-700 underline underline-offset-2 hover:text-primary-900"
            >
              {entry.title}
            </a>
          </p>
        </li>
      ))}
    </ul>
  );
}
