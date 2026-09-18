/** Small uppercase kicker above a section title. */
export default function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary-600">
      {children}
    </p>
  );
}
