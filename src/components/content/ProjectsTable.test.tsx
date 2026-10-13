import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import ProjectsTable from './ProjectsTable';
import { parseProjectRecord, type ProjectRecord } from '../../lib/projects';

function row(id: string, name: string, value: number, text: string) {
  const parsed = parseProjectRecord(id, {
    publicationStatus: 'published',
    project: {
      name,
      implementingAgency: 'DPWH Example DEO',
      amount: { text, value, statement: `costing ${text}` },
      status: 'completed',
      location: 'Barangay Example',
    },
    provenance: {
      verificationStatus: 'sourced',
      lastVerifiedAt: '2026-10-12',
      sources: [
        {
          title: 'Release',
          organization: 'DPWH',
          url: 'https://dpwh.gov.ph/example',
          type: 'national_government',
          locator: 'Paragraph 2',
        },
      ],
    },
  });
  return parsed as ProjectRecord;
}

const projects = [
  row('b', 'Beta road', 50000000, 'P50 million'),
  row('a', 'Alpha bridge', 7100000, 'P7.1 million'),
];

const firstColumn = () =>
  screen.getAllByRole('rowheader').map(cell => cell.textContent?.trim());

describe('ProjectsTable', () => {
  it('shows source, locator and not-stated markers', () => {
    render(<ProjectsTable projects={projects} />);

    expect(screen.getAllByText('Location in source: Paragraph 2')).toHaveLength(
      2
    );
    expect(
      screen.getAllByText('Not stated in the source').length
    ).toBeGreaterThan(0);
    expect(
      screen.getByText('Source wording: “costing P50 million”')
    ).toBeInTheDocument();
  });

  it('sorts by a column and toggles direction', () => {
    render(<ProjectsTable projects={projects} />);
    expect(firstColumn()).toEqual(['Alpha bridge', 'Beta road']);

    const header = screen.getByRole('columnheader', {
      name: /Amount as stated/,
    });
    fireEvent.click(within(header).getByRole('button'));
    expect(header).toHaveAttribute('aria-sort', 'ascending');
    expect(firstColumn()).toEqual(['Alpha bridge', 'Beta road']);

    fireEvent.click(within(header).getByRole('button'));
    expect(header).toHaveAttribute('aria-sort', 'descending');
    expect(firstColumn()).toEqual(['Beta road', 'Alpha bridge']);
  });
});
