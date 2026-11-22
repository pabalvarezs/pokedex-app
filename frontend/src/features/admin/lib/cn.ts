import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Combina clases condicionales y resuelve las que se contradicen. */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
