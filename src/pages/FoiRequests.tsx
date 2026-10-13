import Section from '../components/ui/Section';
import Breadcrumbs from '../components/ui/Breadcrumbs';
import { Heading } from '../components/ui/Heading';
import { Text } from '../components/ui/Text';
import SEO from '../components/SEO';
import FoiRequestsList from '../components/content/FoiRequestsList';
import ReportCorrectionLink from '../components/content/ReportCorrectionLink';
import { publicFoiRequests } from '../lib/foiRequests';
import { FOI_DESCRIPTION, FOI_STATEMENT, FOI_TITLE } from '../lib/foiCopy';

export default function FoiRequests() {
  return (
    <>
      <SEO title={FOI_TITLE} description={FOI_DESCRIPTION} />
      <main>
        <Section className="p-3 mb-12">
          <Breadcrumbs
            className="mb-8"
            items={[
              { label: 'Home', href: '/' },
              { label: FOI_TITLE, href: '/foi-requests' },
            ]}
          />
          <Heading>{FOI_TITLE}</Heading>
          <Text className="mb-6 text-gray-700">{FOI_STATEMENT}</Text>
          <FoiRequestsList requests={publicFoiRequests} />
          <ReportCorrectionLink contentReference="/foi-requests" />
        </Section>
      </main>
    </>
  );
}
