import { render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import App from './App';

const translations: Record<string, string> = {
  'hero.subtitle':
    'Community-maintained civic information for the Municipality of Gattaran.',
  'services.title': 'Services & Information',
  'services.description': 'Browse municipal service categories.',
  'governmentActivity.title': 'Government Activity',
  'governmentActivity.description': 'Browse municipal information.',
  'navbar.services': 'Services',
  'navbar.government': 'Government',
  'footer.status':
    'Better Gattaran is a community-driven civic information portal and is not presented as the official Municipality of Gattaran website.',
  'footer.attribution': 'Built from BetterLocalGov by BetterGov.',
};

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => translations[key] ?? key,
    i18n: {
      language: 'en',
      changeLanguage: vi.fn(),
    },
  }),
}));

function renderRoute(path: string) {
  window.history.pushState({}, '', path);
  return render(<App />);
}

describe('Better Gattaran baseline', () => {
  beforeEach(() => {
    window.history.pushState({}, '', '/');
  });

  it('keeps the portal identity distinct from the referenced government', async () => {
    renderRoute('/');

    expect(
      await screen.findByRole('heading', { level: 1, name: 'Better Gattaran' })
    ).toBeInTheDocument();
    expect(
      screen.getAllByText(/Civic information for Municipality of Gattaran/i)
    ).toHaveLength(2);
    expect(
      screen.getByText(
        /not presented as the official Municipality of Gattaran/i
      )
    ).toBeInTheDocument();
    const languageOptions = screen.getAllByRole('option');
    expect(languageOptions).toHaveLength(2);
    languageOptions.forEach(option => {
      expect(option).toHaveTextContent('English');
      expect(option).toHaveValue('en');
    });

    await waitFor(() => {
      expect(document.title).toBe('Home | Better Gattaran');
    });
    expect(document.querySelector('link[rel="canonical"]')).toBeNull();
  });

  it.each([
    ['/services', 'Municipal service categories'],
    ['/government/departments', 'Municipal Government'],
  ])('renders the representative route %s', async (path, heading) => {
    renderRoute(path);

    expect(
      await screen.findByRole('heading', { name: heading })
    ).toBeInTheDocument();
  });

  it('renders the intentional empty state for a service category', async () => {
    renderRoute('/services/health-services');

    expect(
      await screen.findByText('Local service details pending verification')
    ).toBeInTheDocument();
    expect(document.body).not.toHaveTextContent(/Lapu[\s-]?Lapu/i);
  });

  it('shows no content for a removed legacy service route', async () => {
    renderRoute(
      '/services/health-services/get-free-check-ups-basic-medicines-and-vaccines'
    );

    expect(
      await screen.findByText(
        /Document Not Found|Information awaiting verification/
      )
    ).toBeInTheDocument();
    expect(document.body).not.toHaveTextContent(/Lapu[\s-]?Lapu/i);
  });

  it('routes verified municipal content with visible provenance', async () => {
    renderRoute('/government/departments/municipality-overview');

    expect(
      await screen.findByRole('heading', {
        name: 'Municipality of Gattaran overview',
      })
    ).toBeInTheDocument();
    expect(
      screen.getByText('59,704 (2024 Census of Population)')
    ).toBeInTheDocument();
    expect(screen.getByText('Verified public information')).toBeInTheDocument();
    expect(screen.getByText('Last verified:')).toBeInTheDocument();
    expect(
      screen.getByRole('link', {
        name: /Municipality of Gattaran.*opens in a new tab/,
      })
    ).toHaveAttribute(
      'href',
      'https://psa.gov.ph/classification/psgc/barangays/0201513000'
    );
  });

  it('keeps unverified service listings in a pending state', async () => {
    renderRoute('/services/health-services');

    expect(
      await screen.findByText('Local service details pending verification')
    ).toBeInTheDocument();
    expect(
      screen.queryByText('Get free check-ups, basic medicines, and vaccines')
    ).not.toBeInTheDocument();
  });
});
