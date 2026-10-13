import { Link } from 'react-router';
import Section from '../ui/Section';
import { Heading } from '../ui/Heading';
import WhatsNewList from '../content/WhatsNewList';
import { useWhatsNew } from '../../hooks/useWhatsNew';
import { WHATS_NEW_TITLE } from '../../lib/whatsNew';

const TEASER_COUNT = 3;

export default function WhatsNewTeaser() {
  const data = useWhatsNew();
  if (!data || data.entries.length === 0) return null;

  return (
    <Section>
      <Heading level={2}>{WHATS_NEW_TITLE}</Heading>
      <WhatsNewList entries={data.entries.slice(0, TEASER_COUNT)} />
      <p className="mt-4">
        <Link
          to="/whats-new"
          className="font-medium text-primary-700 underline underline-offset-2 hover:text-primary-900"
        >
          See all recent changes
        </Link>
      </p>
    </Section>
  );
}
