import { useId } from "react";

interface IconProps {
  className?: string;
}

/** Iconos de navegación del sitio. Trazo simple para heredar el color del texto. */

export { PokeballIcon, StarIcon } from "../favorites/icons";

interface ChileBallIconProps extends IconProps {
  /** Color del botón central: azul para la marca, rojo para el panel de admin. */
  center?: "blue" | "red";
}

/** Poké Ball con la bandera chilena y la estrella, derivada del favicon del sitio. */
export function ChileBallIcon({ className = "", center = "blue" }: ChileBallIconProps) {
  // IDs únicos por instancia: el header y el admin montan la bola a la vez.
  const uid = useId().replace(/:/g, "");
  const redId = `chile-ball-red-${uid}`;
  const blueId = `chile-ball-blue-${uid}`;
  const clipId = `chile-ball-clip-${uid}`;
  const centerColor = center === "red" ? "#c8231b" : "#0b2f87";

  return (
    <svg viewBox="0 0 100 100" aria-hidden="true" className={className}>
      <defs>
        <linearGradient id={redId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f0503a" />
          <stop offset="1" stopColor="#c8231b" />
        </linearGradient>
        <linearGradient id={blueId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#1c4fc2" />
          <stop offset="1" stopColor="#0b2f87" />
        </linearGradient>
        <clipPath id={clipId}>
          <circle cx="50" cy="50" r="43" />
        </clipPath>
      </defs>
      <circle cx="50" cy="50" r="47" fill="#101a40" />
      <g clipPath={`url(#${clipId})`}>
        <rect x="0" y="0" width="100" height="43" fill={`url(#${redId})`} />
        <rect x="0" y="43" width="100" height="14" fill="#ffffff" />
        <rect x="0" y="57" width="100" height="43" fill={`url(#${blueId})`} />
      </g>
      <circle cx="50" cy="50" r="17" fill="#101a40" />
      <circle cx="50" cy="50" r="13" fill="#ffffff" />
      <circle cx="50" cy="50" r="10" fill={centerColor} />
      <path
        fill="#ffffff"
        d="M50 42 52 47.25 57.61 47.53 53.23 51.05 54.7 56.47 50 53.4 45.3 56.47 46.77 51.05 42.39 47.53 48 47.25Z"
      />
    </svg>
  );
}

export function HomeIcon({ className = "" }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      <path d="m3 10.5 9-7.5 9 7.5" />
      <path d="M5 9.5V21h14V9.5" />
      <path d="M9.5 21v-6h5v6" />
    </svg>
  );
}

export function ShieldIcon({ className = "" }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      <path d="M12 3l7 3v5.2c0 4.4-2.9 7.5-7 9-4.1-1.5-7-4.6-7-9V6l7-3z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

export function DatabaseIcon({ className = "" }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      <ellipse cx="12" cy="5.5" rx="8" ry="3" />
      <path d="M4 5.5v6c0 1.66 3.58 3 8 3s8-1.34 8-3v-6" />
      <path d="M4 11.5v6c0 1.66 3.58 3 8 3s8-1.34 8-3v-6" />
    </svg>
  );
}

export function KeyIcon({ className = "" }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      <circle cx="8" cy="15" r="4" />
      <path d="m11 12 9-9" />
      <path d="m17 6 2 2" />
      <path d="m14 9 2 2" />
    </svg>
  );
}

export function LogoutIcon({ className = "" }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      <path d="M14 4h4a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-4" />
      <path d="M10 8l-4 4 4 4" />
      <path d="M6 12h9" />
    </svg>
  );
}

export function MenuIcon({ className = "" }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      aria-hidden="true"
      className={className}
    >
      <path d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  );
}

export function CloseIcon({ className = "" }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      aria-hidden="true"
      className={className}
    >
      <path d="m6 6 12 12M18 6 6 18" />
    </svg>
  );
}
