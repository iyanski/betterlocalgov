import Section from '../components/ui/Section';
import Breadcrumbs from '../components/ui/Breadcrumbs';
import { Heading } from '../components/ui/Heading';
import { Text } from '../components/ui/Text';
import SEO from '../components/SEO';
import WhatsNewList from '../components/content/WhatsNewList';
import { useWhatsNew } from '../hooks/useWhatsNew';
import { WHATS_NEW_DESCRIPTION, WHATS_NEW_TITLE } from '../lib/whatsNew';

export default function WhatsNew() {
  const data = useWhatsNew();

  return (
    <>
      <SEO title={WHATS_NEW_TITLE} description={WHATS_NEW_DESCRIPTION} />
      <main>
        <Section className="p-3 mb-12">
          <Breadcrumbs
            className="mb-8"
            items={[
              { label: 'Home', href: '/' },
              { label: WHATS_NEW_TITLE, href: '/whats-new' },
            ]}
          />
          <Heading>{WHATS_NEW_TITLE}</Heading>
          <Text className="mb-6 text-gray-700">
            {WHATS_NEW_DESCRIPTION} Only records that are currently public are
            listed.
          </Text>
          {data ? (
            <WhatsNewList entries={data.entries} />
          ) : (
            <p className="text-gray-700">Loading recent changes…</p>
          )}
        </Section>
      </main>
    </>
  );
}
