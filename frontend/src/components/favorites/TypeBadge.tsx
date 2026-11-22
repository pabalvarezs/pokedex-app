import SharedTypeBadge from "../TypeBadge";

interface Props {
  type: string;
}

/** Insignia grande con símbolo para las vitrinas de regalones. */
export default function TypeBadge({ type }: Props) {
  return <SharedTypeBadge type={type} size="md" />;
}
