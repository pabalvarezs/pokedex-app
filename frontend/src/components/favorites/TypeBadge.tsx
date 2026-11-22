import SharedTypeBadge from "../TypeBadge";

interface Props {
  type: string;
}

/** Variante sólida con emoji para las vitrinas de regalones. */
export default function TypeBadge({ type }: Props) {
  return <SharedTypeBadge type={type} variant="solid" showEmoji />;
}
