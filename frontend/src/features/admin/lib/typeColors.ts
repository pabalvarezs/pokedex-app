/**
 * Re-export de la paleta de tipos que ya usa toda la Pokédex.
 * `utils/pokemon.ts` sigue siendo la única fuente de verdad: acá no se
 * duplican colores ni se abre una segunda paleta que pueda divergir.
 */
export { POKEMON_TYPES, getTypeBadge } from "../../../utils/pokemon";
export type { TypeInfo } from "../../../utils/pokemon";
