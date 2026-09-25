import { emergencyHotlines } from '../../data/hotlines';

/**
 * Emergency & quick hotlines strip shown right below the hero banner,
 * so the numbers people need most in a crisis are visible without
 * digging through the menu.
 */
const EmergencyHotlinesSection: React.FC = () => {
  return (
    <section
      id="emergency-hotlines"
      aria-labelledby="emergency-hotlines-heading"
      className="border-y border-red-900 bg-red-950 text-white"
    >
      <div className="container mx-auto px-4 py-6">
        <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <h2
            id="emergency-hotlines-heading"
            className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] text-red-100"
          >
            <i className="ri-phone-line text-base" aria-hidden="true" />
            Emergency &amp; Quick Hotlines
          </h2>
          <p className="text-xs text-red-200/80">
            Tap a number to call directly from your phone.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-7">
          {emergencyHotlines.map(item => (
            <a
              key={item.label}
              href={`tel:${item.number}`}
              className="flex flex-col items-center gap-1.5 rounded-lg border border-red-300/20 bg-red-900/50 px-3 py-3 text-center transition-colors hover:bg-red-800/70"
            >
              <i
                className={`${item.icon} text-xl text-red-100`}
                aria-hidden="true"
              />
              <span className="text-xs font-semibold text-white">
                {item.label}
              </span>
              <span className="text-[11px] text-red-100/80">{item.number}</span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
};

export default EmergencyHotlinesSection;
