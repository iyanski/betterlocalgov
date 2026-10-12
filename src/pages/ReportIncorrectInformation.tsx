import { useMemo, useState, type FormEvent } from 'react';
import { ExternalLink } from 'lucide-react';
import { useSearchParams } from 'react-router';
import SEO from '../components/SEO';
import Section from '../components/ui/Section';
import { Heading } from '../components/ui/Heading';
import { contentGovernanceConfig } from '../config/contentGovernance';
import {
  buildCorrectionIssueUrl,
  CORRECTION_REASONS,
  validateCorrectionReport,
} from '../lib/correctionReport';

export default function ReportIncorrectInformation() {
  const [searchParams] = useSearchParams();
  const initialPage = useMemo(
    () => (searchParams.get('page') || '').slice(0, 300),
    [searchParams]
  );
  const [errors, setErrors] = useState<Record<string, string>>({});

  function submitReport(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const page = String(form.get('page') || '').trim();
    const reason = String(form.get('reason') || '').trim();
    const correction = String(form.get('correction') || '').trim();
    const sourceUrl = String(form.get('sourceUrl') || '').trim();
    const website = String(form.get('website') || '').trim();
    const report = { page, reason, correction, sourceUrl, website };
    const nextErrors = validateCorrectionReport(report);

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    window.location.assign(
      buildCorrectionIssueUrl(
        report,
        contentGovernanceConfig.correctionIssueUrl
      )
    );
  }

  if (!contentGovernanceConfig.correctionReportsEnabled) {
    return (
      <main>
        <Section className="max-w-2xl py-10">
          <Heading>Correction reports are unavailable</Heading>
          <p className="mt-4 text-gray-700">
            Public correction reporting is currently disabled.
          </p>
        </Section>
      </main>
    );
  }

  const inputClass =
    'mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-200';

  return (
    <>
      <SEO
        title="Report incorrect information"
        description="Flag information that may be incorrect, outdated, or unsupported."
      />
      <main>
        <Section className="max-w-2xl py-10">
          <Heading>Report incorrect information</Heading>
          <p className="mt-4 text-gray-700">
            Your report will be prepared as a public GitHub issue for maintainer
            review. Do not include your email address, phone number, or other
            private information. GitHub authentication and anti-abuse controls
            apply when you submit it.
          </p>
          <form className="mt-8 space-y-5" onSubmit={submitReport} noValidate>
            {errors.form && (
              <p role="alert" className="text-sm font-medium text-error-700">
                {errors.form}
              </p>
            )}
            <div>
              <label htmlFor="page" className="font-medium text-gray-900">
                Page or content reference
              </label>
              <input
                id="page"
                name="page"
                defaultValue={initialPage}
                maxLength={300}
                required
                aria-describedby={errors.page ? 'page-error' : undefined}
                className={inputClass}
              />
              {errors.page && (
                <p
                  id="page-error"
                  role="alert"
                  className="mt-1 text-sm text-error-700"
                >
                  {errors.page}
                </p>
              )}
            </div>
            <div>
              <label htmlFor="reason" className="font-medium text-gray-900">
                Reason
              </label>
              <select id="reason" name="reason" required className={inputClass}>
                <option value="">Choose a reason</option>
                {CORRECTION_REASONS.map(reason => (
                  <option key={reason} value={reason}>
                    {reason}
                  </option>
                ))}
              </select>
              {errors.reason && (
                <p role="alert" className="mt-1 text-sm text-error-700">
                  {errors.reason}
                </p>
              )}
            </div>
            <div>
              <label htmlFor="correction" className="font-medium text-gray-900">
                What should be corrected?
              </label>
              <textarea
                id="correction"
                name="correction"
                rows={6}
                minLength={10}
                maxLength={2000}
                required
                aria-describedby={
                  errors.correction ? 'correction-error' : undefined
                }
                className={inputClass}
              />
              {errors.correction && (
                <p
                  id="correction-error"
                  role="alert"
                  className="mt-1 text-sm text-error-700"
                >
                  {errors.correction}
                </p>
              )}
            </div>
            <div>
              <label htmlFor="sourceUrl" className="font-medium text-gray-900">
                Supporting source URL{' '}
                <span className="font-normal">(optional)</span>
              </label>
              <input
                id="sourceUrl"
                name="sourceUrl"
                type="url"
                maxLength={1000}
                placeholder="https://…"
                aria-describedby={errors.sourceUrl ? 'source-error' : undefined}
                className={inputClass}
              />
              {errors.sourceUrl && (
                <p
                  id="source-error"
                  role="alert"
                  className="mt-1 text-sm text-error-700"
                >
                  {errors.sourceUrl}
                </p>
              )}
            </div>
            <div className="hidden" aria-hidden="true">
              <label htmlFor="website">Leave this field empty</label>
              <input
                id="website"
                name="website"
                tabIndex={-1}
                autoComplete="off"
              />
            </div>
            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-md bg-primary-700 px-4 py-2.5 font-semibold text-white hover:bg-primary-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-700"
            >
              Continue to GitHub
              <ExternalLink className="h-4 w-4" aria-hidden="true" />
            </button>
          </form>
        </Section>
      </main>
    </>
  );
}
