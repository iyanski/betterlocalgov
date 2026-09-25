import { useEffect, useState } from 'react';
import { useTyphoonAdvisory } from '../../hooks/useTyphoonAdvisory';

const DISMISS_KEY = 'betteraparri:typhoon-advisory-dismissed';

function formatDateRange(fromDate: string, toDate: string): string {
  const format = (value: string) => {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return null;
    return date.toLocaleDateString('en-PH', {
      month: 'short',
      day: 'numeric',
    });
  };

  const from = format(fromDate);
  const to = format(toDate);
  if (from && to) return `${from} – ${to}`;
  return from ?? to ?? '';
}

/**
 * Sitewide banner shown above the navbar when GDACS reports an
 * Orange/Red tropical cyclone alert affecting the Philippines.
 *
 * IMPORTANT: GDACS is not PAGASA. This is a general regional severity
 * signal, not an official PAGASA wind-signal number for Aparri/Cagayan
 * — the banner says so explicitly and links out to PAGASA, since
 * PAGASA has no public feed of its own to pull the exact local signal
 * from (see docs/plan/09-typhoon-advisory-banner).
 */
export default function TyphoonAdvisoryBanner() {
  const { advisory } = useTyphoonAdvisory();
  const [dismissedId, setDismissedId] = useState<string | null>(null);

  useEffect(() => {
    try {
      setDismissedId(sessionStorage.getItem(DISMISS_KEY));
    } catch {
      setDismissedId(null);
    }
  }, []);

  if (!advisory || advisory.id === dismissedId) {
    return null;
  }

  const isRed = advisory.alertLevel === 'Red';
  const dateRange = formatDateRange(advisory.fromDate, advisory.toDate);

  const dismiss = () => {
    try {
      sessionStorage.setItem(DISMISS_KEY, advisory.id);
    } catch {
      // sessionStorage unavailable — dismiss just won't persist.
    }
    setDismissedId(advisory.id);
  };

  return (
    <div
      role="alert"
      className={`${isRed ? 'bg-red-700' : 'bg-orange-600'} text-white`}
    >
      <div className="container mx-auto flex flex-col gap-2 px-4 py-2.5 text-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-2 sm:items-center">
          <i
            className="ri-alarm-warning-fill mt-0.5 shrink-0 text-lg sm:mt-0"
            aria-hidden="true"
          />
          <p className="leading-snug">
            <span className="font-bold">
              {isRed ? 'Red Alert' : 'Orange Alert'}:
            </span>{' '}
            {advisory.severityText} {advisory.name} may affect the Philippines
            {dateRange ? ` (${dateRange})` : ''}. This is a general regional
            alert from GDACS —{' '}
            <span className="font-semibold">
              not an official PAGASA wind signal for Aparri.
            </span>{' '}
            Follow{' '}
            <a
              href="https://www.pagasa.dost.gov.ph/tropical-cyclone/severe-weather-bulletin"
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-2 hover:no-underline"
            >
              PAGASA's official bulletin
            </a>{' '}
            and local MDRRMO advisories for confirmed signal numbers and
            guidance.
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-3 self-end sm:self-auto">
          <a
            href={advisory.reportUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="whitespace-nowrap text-xs font-semibold underline underline-offset-2 hover:no-underline"
          >
            GDACS report
          </a>
          <button
            type="button"
            onClick={dismiss}
            aria-label="Dismiss advisory"
            className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-black/15 hover:bg-black/25"
          >
            <i className="ri-close-line text-base" aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  );
}
