import SharedTypeBadge from "../../../components/TypeBadge";

interface Props {
  type: string;
  size?: "sm" | "md";
}

/** Insignia compacta para las tablas densas del panel (sin símbolo). */
export default function TypeBadge({ type, size = "md" }: Props) {
  return (
    <SharedTypeBadge
      type={type}
      size={size === "sm" ? "xs" : "sm"}
      showIcon={false}
    />
  );
}
