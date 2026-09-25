import type { NavigationItem } from '../types';
import { serviceCategories as servicesData } from './yamlLoader';

interface Subcategory {
  name: string;
  slug: string;
}

interface Category {
  category: string;
  slug: string;
  subcategories: Subcategory[];
}

export const mainNavigation: NavigationItem[] = [
  // {
  //   label: 'Home',
  //   href: '/',
  // },
  {
    label: 'Services',
    href: '/services',
    children: (servicesData.categories as Category[]).map(category => ({
      label: category.category,
      href: `/services/${category.slug}`,
    })),
  },
  {
    label: 'Government',
    href: '/government',
    children: [
      {
        label: 'Leadership',
        href: '/government/leadership',
      },
      {
        label: 'Barangays',
        href: '/government/barangays',
      },
    ],
  },
  {
    label: 'Updates',
    href: '/updates',
  },
  {
    label: 'Transparency',
    href: '/transparency',
    children: [
      {
        label: 'ARI and Dependencies',
        href: '/transparency/annual-regular-income-and-dependencies',
      },
      {
        label: 'Receipts and Expenditures',
        href: '/transparency/statements-of-receipts-and-expenditure',
      },
      {
        label: 'DRRM Funds',
        href: '/transparency/disaster-risk-reduction-and-management',
      },
      {
        label: 'Special Education Funds',
        href: '/transparency/special-education-fund',
      },
      {
        label: 'Procurement',
        href: '/transparency/procurement',
      },
      {
        label: 'DPWH Projects',
        href: '/transparency/dpwh-projects',
      },
    ],
  },
  {
    label: 'Statistics',
    href: '/statistics',
    children: [
      {
        label: 'Demographics',
        href: '/statistics/demographics',
      },
      {
        label: 'Competitiveness',
        href: '/statistics/competitiveness',
      },
    ],
  },
];

export const footerNavigation = {
  mainSections: [
    {
      title: 'Quick Links',
      links: [
        { label: 'Citizen Services', href: '/services' },
        { label: 'Leadership', href: '/government/leadership' },
        { label: 'Demographics', href: '/statistics/demographics' },
        { label: 'Sitemap', href: '/sitemap.xml' },
        // { label: 'Community Discord', href: '/discord' },
      ],
    },
    {
      title: 'Resources',
      links: [
        {
          label: 'Official Gazette',
          href: 'https://www.officialgazette.gov.ph',
        },
        { label: 'Open Data', href: 'https://data.gov.ph' },
        { label: 'Freedom of Information', href: 'https://www.foi.gov.ph' },
        {
          label: 'Contact Center ng Bayan',
          href: 'https://contactcenterngbayan.gov.ph',
        },
      ],
    },
  ],
  socialLinks: [
    { label: 'Facebook', href: 'https://facebook.com/betteraparri.org' },
    { label: 'GitHub', href: 'https://github.com/egiebk/betteraparri' },
  ],
};
