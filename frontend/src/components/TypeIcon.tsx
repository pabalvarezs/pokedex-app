import type { ReactNode } from "react";

interface Props {
  type: string;
  className?: string;
}

/**
 * Símbolos vectoriales de los 18 tipos. Se dibujan con `currentColor` para
 * heredar el color del badge y no depender de emoji del sistema operativo.
 */
const ICONS: Record<string, ReactNode> = {
  normal: (
    <>
      <circle cx="12" cy="12" r="8" />
      <circle cx="12" cy="12" r="3.2" />
    </>
  ),
  fire: (
    <path d="M12 2c1.2 4 6.2 5.2 6.2 11.2A6.2 6.2 0 0 1 5.8 13c0-3 2-5.2 3-7.2 0 2.2 1 3.2 2 3.2 0-3 .2-5.2 1.2-7Z" />
  ),
  water: <path d="M12 2c3 4 7 8.2 7 12.2a7 7 0 0 1-14 0C5 10.2 9 6 12 2Z" />,
  electric: <path d="M13 2 5 13h6l-1 9 9-12h-6l1-8Z" />,
  grass: (
    <>
      <path d="M20 4C10 4 4 9 4 16c0 2.2 1.2 4 3.2 4C14 20 20 14 20 4Z" />
      <path d="M4 20c3-5 7-8 12-10" />
    </>
  ),
  ice: (
    <>
      <path d="M12 2v20M3.4 7l17.2 10M20.6 7 3.4 17" />
      <path d="m9 5 3 2 3-2M9 19l3-2 3 2" />
    </>
  ),
  fighting: <path d="M12 2 15 9l7 3-7 3-3 7-3-7-7-3 7-3 3-7Z" />,
  poison: (
    <>
      <path d="M12 2c3 4 6.5 7.5 6.5 11.5a6.5 6.5 0 1 1-13 0C5.5 9.5 9 6 12 2Z" />
      <circle cx="10" cy="13" r="1.1" fill="currentColor" stroke="none" />
      <circle cx="14" cy="13" r="1.1" fill="currentColor" stroke="none" />
      <path d="M10 17c1.2 1 2.8 1 4 0" />
    </>
  ),
  ground: <path d="M2 20h20L14 7l-4 7-2-3-6 9Z" />,
  flying: (
    <>
      <path d="M3 15c5-8 11-10 18-9-4 2-7 5-9 9-3-1-6-1-9 0Z" />
      <path d="M6 19c3-4 6-6 10-7" />
    </>
  ),
  psychic: (
    <>
      <path d="M2 12s4-6 10-6 10 6 10 6-4 6-10 6S2 12 2 12Z" />
      <circle cx="12" cy="12" r="2.6" />
      <path d="M12 2v2M12 20v2" />
    </>
  ),
  bug: (
    <>
      <rect x="8" y="8" width="8" height="12" rx="4" />
      <path d="M9 8 6 4M15 8l3-4M5 13H2M22 13h-3M5 18l-3 2M19 18l3 2" />
    </>
  ),
  rock: <path d="M5 19 3 10l6-6h6l6 6-2 9H5Z" />,
  ghost: (
    <>
      <path d="M5 20V11a7 7 0 0 1 14 0v9l-3.5-2-3.5 2-3.5-2L5 20Z" />
      <circle cx="9.5" cy="11" r="1.1" fill="currentColor" stroke="none" />
      <circle cx="14.5" cy="11" r="1.1" fill="currentColor" stroke="none" />
    </>
  ),
  dragon: (
    <>
      <path d="M4 4c6 1 12 5 16 15-6-4-11-5-16-4 2-3 3-6 4-11Z" />
      <path d="m8 9 4 1M7 13l4 1" />
    </>
  ),
  dark: <path d="M15.5 2A10 10 0 1 0 22 17 8 8 0 0 1 15.5 2Z" />,
  steel: (
    <>
      <path d="M12 2 21 7v10l-9 5-9-5V7l9-5Z" />
      <circle cx="12" cy="12" r="3" />
    </>
  ),
  fairy: (
    <>
      <path d="m12 2 2.6 7.4L22 12l-7.4 2.6L12 22l-2.6-7.4L2 12l7.4-2.6L12 2Z" />
      <circle cx="18.5" cy="5.5" r="1.2" fill="currentColor" stroke="none" />
    </>
  ),
};

export default function TypeIcon({ type, className = "h-4 w-4" }: Props) {
  const icon = ICONS[type.toLowerCase()];

  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {icon ?? ICONS.normal}
    </svg>
  );
}
