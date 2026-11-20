interface SkeletonProps {
  className?: string;
}

/** Usa el shimmer global de index.css para no crear otra animación. */
export function Skeleton({ className = "" }: SkeletonProps) {
  return <div aria-hidden="true" className={`skeleton rounded-control ${className}`} />;
}

export function SkeletonRows({
  rows = 4,
  className = "",
}: SkeletonProps & { rows?: number }) {
  return (
    <div className={`space-y-2 ${className}`} aria-hidden="true">
      {Array.from({ length: rows }, (_, index) => (
        <Skeleton key={index} className="h-14 w-full" />
      ))}
    </div>
  );
}
