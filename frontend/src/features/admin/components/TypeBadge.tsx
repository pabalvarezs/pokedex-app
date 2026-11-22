import SharedTypeBadge from "../../../components/TypeBadge";

interface Props {
  type: string;
  size?: "sm" | "md";
}

/** Variante compacta del badge compartido para las tablas del panel. */
export default function TypeBadge({ type, size = "md" }: Props) {
  return <SharedTypeBadge type={type} size={size} variant="soft" />;
}
