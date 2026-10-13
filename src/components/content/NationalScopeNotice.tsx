import { Landmark } from 'lucide-react';
import { NATIONAL_SCOPE_NOTICE } from '../../lib/contentGovernance';

/**
 * Fixed notice for `national_applicable` records. It has no props and no
 * dismiss control so it cannot be hidden or reworded per page.
 */
export default function NationalScopeNotice() {
  return (
    <aside
      role="note"
      aria-label="National government procedure"
      className="mb-6 flex items-start gap-3 rounded-lg border border-primary-200 bg-primary-50 p-4 text-sm text-primary-900"
    >
      <Landmark className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
      <p>{NATIONAL_SCOPE_NOTICE}</p>
    </aside>
  );
}
