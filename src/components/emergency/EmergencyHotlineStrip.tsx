import { useState } from 'react';
import { ChevronDown, Phone, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router';
import { publicHotlines, type HotlineRecord } from '../../lib/hotlines';

interface EmergencyHotlineStripProps {
  hotlines?: HotlineRecord[];
}

export default function EmergencyHotlineStrip({
  hotlines = publicHotlines,
}: EmergencyHotlineStripProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  if (hotlines.length === 0) return null;

  const primary = hotlines[0];

  return (
    <aside
      aria-label="Verified emergency hotlines"
      className="bg-error-800 text-white"
    >
      <div className="container mx-auto px-4">
        <div className="hidden min-h-10 items-center gap-3 py-2 text-sm md:flex">
          <span className="inline-flex shrink-0 items-center gap-1.5 font-semibold">
            <Phone className="h-4 w-4" aria-hidden="true" />
            Emergency
          </span>
          <span aria-hidden="true" className="text-error-200">
            |
          </span>
          {hotlines.map((hotline, index) => (
            <span key={hotline.id} className="inline-flex items-center gap-3">
              {index > 0 && (
                <span aria-hidden="true" className="text-error-300">
                  ·
                </span>
              )}
              <a
                href={`tel:${hotline.phone}`}
                aria-label={`Call ${hotline.name} at ${hotline.displayPhone}`}
                className="rounded-sm font-medium underline decoration-error-300 underline-offset-2 hover:decoration-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                {hotline.name}: {hotline.displayPhone}
              </a>
            </span>
          ))}
          <Link
            to="/hotlines"
            className="ml-auto shrink-0 rounded-sm font-semibold underline decoration-error-300 underline-offset-2 hover:decoration-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            View all hotlines
          </Link>
        </div>

        <div className="py-2 md:hidden">
          <div className="flex min-h-10 items-center gap-3">
            <span className="inline-flex items-center gap-1.5 text-sm font-semibold">
              <Phone className="h-4 w-4" aria-hidden="true" />
              Emergency
            </span>
            <a
              href={`tel:${primary.phone}`}
              aria-label={`Call ${primary.name} at ${primary.displayPhone}`}
              className="rounded-sm text-sm font-bold underline decoration-error-300 underline-offset-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              {primary.displayPhone}
            </a>
            <button
              type="button"
              aria-expanded={isExpanded}
              aria-controls="mobile-emergency-hotlines"
              onClick={() => setIsExpanded(value => !value)}
              className="ml-auto inline-flex min-h-10 items-center gap-1 rounded-md px-2 text-sm font-semibold hover:bg-error-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              Hotlines
              <ChevronDown
                aria-hidden="true"
                className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
              />
            </button>
          </div>
          {isExpanded && (
            <div
              id="mobile-emergency-hotlines"
              className="border-t border-error-600 pb-3 pt-2"
            >
              <ul className="space-y-2">
                {hotlines.map(hotline => (
                  <li
                    key={hotline.id}
                    className="flex items-center gap-2 text-sm"
                  >
                    <ShieldCheck
                      className="h-4 w-4 shrink-0"
                      aria-label="Verified"
                    />
                    <span>{hotline.name}</span>
                    <a
                      href={`tel:${hotline.phone}`}
                      aria-label={`Call ${hotline.name} at ${hotline.displayPhone}`}
                      className="ml-auto min-h-10 rounded-sm py-2 font-bold underline decoration-error-300 underline-offset-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                    >
                      {hotline.displayPhone}
                    </a>
                  </li>
                ))}
              </ul>
              <Link
                to="/hotlines"
                className="mt-2 inline-flex min-h-10 items-center rounded-sm py-2 text-sm font-semibold underline decoration-error-300 underline-offset-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                Sources and verification details
              </Link>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
