import { ExternalLink } from 'lucide-react';
import SEO from '../components/SEO';
import Section from '../components/ui/Section';
import { Heading } from '../components/ui/Heading';
import { Text } from '../components/ui/Text';

export default function About() {
  return (
    <>
      <SEO
        title="About"
        description="How Better Gattaran sources, verifies, and presents civic information."
      />
      <main>
        <Section className="max-w-3xl py-10">
          <Heading>About Better Gattaran</Heading>
          <Text className="mt-4 text-lg text-gray-700">
            Better Gattaran is an independent, volunteer-led, open-source civic
            technology initiative. It makes public information about Gattaran
            easier to find and understand, but it is not the official website of
            the Municipality of Gattaran and does not speak for the
            Municipality.
          </Text>

          <Heading level={2} className="mt-10">
            How information is handled
          </Heading>
          <div className="mt-4 space-y-4 text-gray-700">
            <p>
              Municipality-specific facts are published only when their source
              and review state are recorded. Every published record identifies
              whether it is verified, merely sourced, or potentially outdated.
              Draft and archived records are not public.
            </p>
            <p>
              “Sourced” means a public reference is available but Better
              Gattaran has not independently confirmed the information.
              “Verified” means a maintainer checked the information against the
              displayed source. Neither label implies endorsement by the LGU.
            </p>
            <p>
              Last updated records when this portal changed a page. Last
              verified records when its facts were checked against a source; the
              dates may differ.
            </p>
          </div>

          <Heading level={2} className="mt-10">
            Sources and corrections
          </Heading>
          <Text className="mt-4 text-gray-700">
            Better Gattaran prefers official government publications and shows
            source links without implying endorsement. If a record appears wrong
            or stale, use the “Report incorrect information” link on that page.
          </Text>
          <a
            href="https://github.com/ginxFromYt/bettergattaran"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-flex items-center gap-2 font-medium text-primary-700 underline underline-offset-2 hover:text-primary-900"
          >
            View the open-source project
            <ExternalLink
              className="h-4 w-4"
              aria-label="(opens in a new tab)"
            />
          </a>
        </Section>
      </main>
    </>
  );
}
