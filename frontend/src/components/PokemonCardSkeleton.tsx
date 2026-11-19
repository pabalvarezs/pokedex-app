export default function PokemonCardSkeleton() {
  return (
    <article
      aria-hidden="true"
      className="glass-surface flex h-full flex-col overflow-hidden rounded-card border border-line bg-surface shadow-card"
    >
      <div className="flex flex-1 flex-col gap-3 p-3 sm:p-3.5">
        <div className="skeleton aspect-square w-full rounded-[12px]" />
        <div className="flex flex-1 flex-col items-center gap-2">
          <div className="skeleton h-4 w-3/4 rounded-full" />
          <div className="flex gap-1.5">
            <div className="skeleton h-[18px] w-14 rounded-full" />
            <div className="skeleton h-[18px] w-12 rounded-full" />
          </div>
        </div>
      </div>
      <div className="px-3 pb-3 sm:px-3.5 sm:pb-3.5">
        <div className="skeleton h-10 w-full rounded-control" />
      </div>
    </article>
  );
}
