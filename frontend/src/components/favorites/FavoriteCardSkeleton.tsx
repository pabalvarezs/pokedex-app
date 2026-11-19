export default function FavoriteCardSkeleton() {
  return (
    <article
      aria-hidden="true"
      className="glass-surface flex h-full flex-col overflow-hidden rounded-card border border-line bg-surface shadow-card"
    >
      <div className="flex flex-1 flex-col">
        <div className="skeleton aspect-[5/4] w-full" />
        <div className="flex flex-1 flex-col gap-3 p-4">
          <div className="flex items-center justify-between gap-2">
            <div className="skeleton h-5 w-2/3 rounded-full" />
            <div className="skeleton h-4 w-12 rounded-full" />
          </div>
          <div className="flex gap-1.5">
            <div className="skeleton h-[26px] w-20 rounded-full" />
            <div className="skeleton h-[26px] w-16 rounded-full" />
          </div>
        </div>
      </div>
      <div className="px-4 pb-4">
        <div className="skeleton h-[44px] w-full rounded-control" />
      </div>
    </article>
  );
}
