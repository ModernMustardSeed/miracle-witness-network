/**
 * The first paint while the wire is being read. It occupies the same grid the
 * real front page uses, so nothing shifts when the stories arrive.
 */
export default function Loading() {
  return (
    <div className="mx-auto max-w-broadsheet px-4 pb-16 pt-8 sm:px-6" aria-busy="true">
      <div className="rule-double mb-6 flex items-baseline justify-between pt-3">
        <span className="kicker text-ink-faint">Reading the wire</span>
        <span className="kicker text-ink-faint">One moment</span>
      </div>
      <div className="grid gap-10 lg:grid-cols-12 lg:gap-8">
        <div className="lg:col-span-8">
          <div className="aspect-[16/9] w-full animate-pulse bg-paper-tint sm:aspect-[2/1]" />
          <div className="mt-5 space-y-3">
            <div className="h-3 w-24 animate-pulse bg-paper-tint" />
            <div className="h-10 w-full animate-pulse bg-paper-tint" />
            <div className="h-10 w-4/5 animate-pulse bg-paper-tint" />
            <div className="h-4 w-full animate-pulse bg-paper-tint" />
            <div className="h-4 w-11/12 animate-pulse bg-paper-tint" />
          </div>
        </div>
        <div className="lg:col-span-4 lg:col-rule lg:pl-8">
          <div className="mb-4 h-3 w-20 animate-pulse bg-paper-tint" />
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="border-b border-rule py-4">
              <div className="h-2.5 w-16 animate-pulse bg-paper-tint" />
              <div className="mt-2 h-4 w-full animate-pulse bg-paper-tint" />
              <div className="mt-1.5 h-4 w-3/4 animate-pulse bg-paper-tint" />
            </div>
          ))}
        </div>
      </div>
      <span className="sr-only">Loading today’s front page.</span>
    </div>
  );
}
