/**
 * Separador con el motivo de la línea central de la Pokéball: una línea
 * tenue con un círculo al centro. Se usa con moderación entre cabecera y filas.
 */
export default function PokeballDivider({ className = "" }: { className?: string }) {
  return (
    <div aria-hidden="true" className={`relative h-px bg-line-soft ${className}`}>
      <span className="absolute left-1/2 top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-line bg-surface" />
    </div>
  );
}
