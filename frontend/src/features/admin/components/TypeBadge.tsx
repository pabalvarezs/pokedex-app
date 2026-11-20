import BaseTypeBadge from "../../../components/favorites/TypeBadge";

interface Props {
  type?: string | null;
}

/**
 * Reutiliza el badge de la sección de favoritos. tolera que el tipo todavía
 * no haya llegado (carga diferida) sin romper el layout de la tabla.
 */
export default function TypeBadge({ type }: Props) {
  if (!type) return null;
  return <BaseTypeBadge type={type} />;
}
