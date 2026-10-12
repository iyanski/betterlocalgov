import { Phone } from 'lucide-react';
import SEO from '../components/SEO';
import ContentProvenance from '../components/content/ContentProvenance';
import ReportCorrectionLink from '../components/content/ReportCorrectionLink';
import Section from '../components/ui/Section';
import { Heading } from '../components/ui/Heading';
import { publicHotlines } from '../lib/hotlines';

export default function Hotlines() {
  return (
    <>
      <SEO
        title="Verified emergency hotlines"
        description="Verified national, Gattaran, and Cagayan emergency contact information with sources."
      />
      <main>
        <Section className="py-10">
          <Heading>Verified emergency hotlines</Heading>
          <p className="mt-3 max-w-3xl text-gray-700">
            Tap a number to open your device’s call prompt. Better Gattaran is
            an independent civic project; these contacts come from the official
            sources shown with each record.
          </p>
          <div className="mt-8 grid gap-6 lg:grid-cols-2">
            {publicHotlines.map(hotline => (
              <article
                key={hotline.id}
                id={hotline.id}
                className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm"
              >
                <Heading level={2}>{hotline.name}</Heading>
                <a
                  href={`tel:${hotline.phone}`}
                  aria-label={`Call ${hotline.name} at ${hotline.displayPhone}`}
                  className="mt-4 inline-flex min-h-12 items-center gap-2 rounded-md bg-error-700 px-4 py-3 text-lg font-bold text-white hover:bg-error-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-error-700"
                >
                  <Phone className="h-5 w-5" aria-hidden="true" />
                  {hotline.displayPhone}
                </a>
                <ContentProvenance provenance={hotline.provenance} />
                <ReportCorrectionLink
                  contentReference={`/hotlines#${hotline.id}`}
                />
              </article>
            ))}
          </div>
        </Section>
      </main>
    </>
  );
}
