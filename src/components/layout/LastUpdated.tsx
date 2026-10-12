import { useWhatsNew } from '../../hooks/useWhatsNew';

function formatLastUpdated(value: string): string {
  return new Intl.DateTimeFormat('en-PH', {
    dateStyle: 'long',
    timeZone: 'UTC',
  }).format(new Date(`${value}T00:00:00Z`));
}

export default function LastUpdated() {
  const data = useWhatsNew();
  if (!data?.lastUpdated) return null;

  return (
    <p className="text-gray-400 text-xs">
      Content last updated:{' '}
      <time dateTime={data.lastUpdated}>
        {formatLastUpdated(data.lastUpdated)}
      </time>
    </p>
  );
}
