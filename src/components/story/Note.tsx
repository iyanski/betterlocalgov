/** Pull-quote aside, for a point that deserves to interrupt the flow. */
export default function Note({ children }: { children: React.ReactNode }) {
  return (
    <div className="my-7 border-l-2 border-secondary-600 pl-5 text-lg leading-relaxed text-gray-600">
      {children}
    </div>
  );
}
