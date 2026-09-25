import { Link } from 'react-router-dom';

type ContactCard = {
  label: string;
  value: string;
  helper: string;
  icon: string;
  href?: string;
  tone: string;
};

const municipalContact = {
  phone: '078-888-2001',
  email: 'lguaparriphil@yahoo.com',
  address: 'Municipal Building, J.P. de Carreon Street',
  mapLink: 'https://maps.app.goo.gl/cvEtDjsQxcFHqbtZ6',
};

const contactCards: ContactCard[] = [
  {
    label: 'Telephone',
    value: municipalContact.phone,
    helper: 'Mon - Fri, 8:00 AM - 5:00 PM',
    icon: 'ri-phone-line',
    href: `tel:${municipalContact.phone}`,
    tone: 'bg-blue-50 text-primary-700',
  },
  {
    label: 'Email',
    value: municipalContact.email,
    helper: 'For general inquiries',
    icon: 'ri-mail-line',
    href: `mailto:${municipalContact.email}`,
    tone: 'bg-emerald-50 text-emerald-700',
  },
  {
    label: 'Address',
    value: municipalContact.address,
    helper: 'Aparri, Cagayan',
    icon: 'ri-map-pin-line',
    href: municipalContact.mapLink,
    tone: 'bg-orange-50 text-orange-700',
  },
];

function ContactCardItem({ card }: { card: ContactCard }) {
  const content = (
    <div className="card-fade-in flex h-full items-start gap-6 rounded-lg border border-slate-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md">
      <span
        aria-hidden="true"
        className={`inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${card.tone}`}
      >
        <i className={`${card.icon} text-xl`} />
      </span>
      <div>
        <p className="text-xs font-semibold uppercase tracking-[1.5px] text-slate-500">
          {card.label}
        </p>
        <p className="mt-1 text-sm font-bold font-mono leading-snug text-primary-800">
          {card.value}
        </p>
        <p className="mt-1 text-sm text-slate-500">{card.helper}</p>
      </div>
    </div>
  );

  if (!card.href) {
    return content;
  }

  return (
    <a href={card.href} className="block h-full" target="_blank">
      {content}
    </a>
  );
}

export default function ContactSection() {
  return (
    <section className="bg-white py-12 sm:py-16" id="contact">
      <div className="container mx-auto max-w-7xl px-4">
        <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-2xl font-bold leading-tight text-slate-900 sm:text-3xl">
            Contact Information
          </h2>
          <Link
            to="/government/leadership"
            className="inline-flex items-center gap-2 text-sm font-bold text-primary-700 transition-colors hover:text-primary-900"
          >
            View Leadership
            <i className="ri-arrow-right-line text-base" aria-hidden="true" />
          </Link>
        </div>

        <div className="grid gap-5 lg:grid-cols-3">
          {contactCards.map(card => (
            <ContactCardItem key={card.label} card={card} />
          ))}
        </div>
      </div>
    </section>
  );
}
