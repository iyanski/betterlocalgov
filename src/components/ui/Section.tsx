export default function Section({ children }: { children: React.ReactNode }) {
  return (
    <section className="py-12 bg-white">
      <div className="container mx-auto px-4">{children}</div>
    </section>
  );
}
