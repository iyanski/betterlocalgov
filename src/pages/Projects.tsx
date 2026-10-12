import Section from '../components/ui/Section';
import Breadcrumbs from '../components/ui/Breadcrumbs';
import { Heading } from '../components/ui/Heading';
import { Text } from '../components/ui/Text';
import SEO from '../components/SEO';
import ProjectsTable from '../components/content/ProjectsTable';
import ReportCorrectionLink from '../components/content/ReportCorrectionLink';
import { publicProjects } from '../lib/projects';
import {
  PROJECTS_DESCRIPTION,
  PROJECTS_STATEMENT,
  PROJECTS_TITLE,
} from '../lib/projectsCopy';

export default function Projects() {
  return (
    <>
      <SEO title={PROJECTS_TITLE} description={PROJECTS_DESCRIPTION} />
      <Section className="p-3 mb-12">
        <Breadcrumbs
          className="mb-8"
          items={[
            { label: 'Home', href: '/' },
            { label: 'Government', href: '/government' },
            { label: PROJECTS_TITLE, href: '/government/projects' },
          ]}
        />
        <Heading>{PROJECTS_TITLE}</Heading>
        <Text className="mb-6 text-gray-700">{PROJECTS_STATEMENT}</Text>
        {publicProjects.length === 0 ? (
          <Text>
            No project from a national agency’s published source has been added
            yet.
          </Text>
        ) : (
          <ProjectsTable projects={publicProjects} />
        )}
        <ReportCorrectionLink contentReference="/government/projects" />
      </Section>
    </>
  );
}
