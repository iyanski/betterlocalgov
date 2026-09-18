import Eyebrow from './Eyebrow';

/**
 * Numbered section header. Data stories run 01..07, and the running number is
 * part of how a reader keeps their place in a long argument.
 */
export default function SectionHeading({
  index,
  label,
  title,
  children,
}: {
  index: string;
  label: string;
  title: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="max-w-3xl">
      <div className="flex items-baseline gap-4">
        <span className="font-mono text-xs tracking-[0.18em] text-gray-400">
          {index}
        </span>
        <Eyebrow>{label}</Eyebrow>
      </div>
      <h2 className="mt-3 text-3xl md:text-5xl font-bold leading-[1.08] tracking-tight text-gray-900">
        {title}
      </h2>
      {children ? (
        <div className="mt-5 text-lg md:text-xl leading-relaxed text-gray-600">
          {children}
        </div>
      ) : null}
    </div>
  );
}
