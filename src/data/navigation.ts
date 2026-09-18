import type { NavigationItem } from '../types';
import { serviceCategories as servicesData } from './yamlLoader';
import { storyNavLinks } from './psc/stories';

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
    href: '/government/about-psc',
  },
  {
    // Navbar renders `children` as a dropdown already, so listing the stories
    // here is the whole nav change. The parent points at the /data index rather
    // than at one story, which is what it used to do.
    label: 'Data',
    href: '/data',
    children: [{ label: 'All data stories', href: '/data' }, ...storyNavLinks],
  },
];

export const footerNavigation = {
  mainSections: [
    {
      title: 'About',
      links: [
        { label: 'About the Portal', href: '/about' },
        // { label: 'Privacy Policy', href: '/privacy' },
        // { label: 'Terms of Use', href: '/terms' },
        { label: 'Accessibility', href: '/accessibility' },
        { label: 'Contact Us', href: '/about' },
        { label: 'Community Discord', href: '/discord' },
      ],
    },
    {
      title: 'Services',
      links: [
        { label: 'All Services', href: '/services' },
        ...(servicesData.categories as Category[])
          .slice(0, 6)
          .map(category => ({
            label: category.category,
            href: `/services/${category.slug}`,
          })),
        { label: 'Hotlines', href: '/philippines/hotlines' },
        { label: 'Holidays', href: '/philippines/holidays' },
      ],
    },
    {
      title: 'Data',
      links: [{ label: 'All data stories', href: '/data' }, ...storyNavLinks],
    },
    {
      title: 'Government',
      links: [
        { label: 'Open Data', href: 'https://data.gov.ph' },
        { label: 'Freedom of Information', href: 'https://www.foi.gov.ph' },
        {
          label: 'Contact Center',
          href: 'https://contactcenterngbayan.gov.ph',
        },
        {
          label: 'Official Gazette',
          href: 'https://www.officialgazette.gov.ph',
        },
      ],
    },
  ],
  socialLinks: [
    { label: 'Facebook', href: 'https://facebook.com/govph' },
    { label: 'Twitter', href: 'https://twitter.com/govph' },
    { label: 'Instagram', href: 'https://instagram.com/govph' },
    { label: 'YouTube', href: 'https://youtube.com/govph' },
  ],
};
