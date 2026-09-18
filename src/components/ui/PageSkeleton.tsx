/**
 * Placeholder shown while a lazily-loaded route chunk arrives.
 *
 * Deliberately quiet and roughly page-shaped: a spinner on a fast local chunk
 * flashes and reads as an error. `aria-busy` tells a screen reader something is
 * coming rather than leaving it announcing an empty main.
 */
export default function PageSkeleton() {
  return (
    <main className="flex-grow" aria-busy="true" aria-live="polite">
      <span className="sr-only">Loading page</span>
      <div className="container mx-auto px-4 py-16 md:py-24">
        <div className="max-w-3xl animate-pulse space-y-5">
          <div className="h-3 w-28 rounded-sm bg-gray-200" />
          <div className="h-10 w-3/4 rounded-sm bg-gray-200" />
          <div className="h-4 w-full rounded-sm bg-gray-100" />
          <div className="h-4 w-5/6 rounded-sm bg-gray-100" />
        </div>
      </div>
    </main>
  );
}
