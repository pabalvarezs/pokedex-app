/**
 * Etiquetas localizadas para las especies con más de una forma Gigamax.
 *
 * Vive en un módulo propio para que `variants.ts` pueda traducir el nombre de
 * una variante Gigamax sin importar `pokemon.ts`, que a su vez importa el
 * catálogo de variantes.
 */
const GMAX_VARIANT_LABELS: Record<string, string> = {
  "toxtricity-amped": "Aguda",
  "toxtricity-low-key": "Grave",
  "urshifu-single-strike": "Brusca",
  "urshifu-rapid-strike": "Fluida",
};

/** Etiqueta localizada para las especies con más de una forma Gigamax. */
export function gmaxVariantLabel(name: string): string | undefined {
  return GMAX_VARIANT_LABELS[name.replace(/-gmax$/, "")];
}
