import { useMemo } from "react";
import { usePokemonPreviews } from "../../../hooks/usePokemonPreviews";

/**
 * Devuelve los tipos por ID de Pokémon apoyándose en el hook de previews que
 * ya existe (mismo endpoint `/api/pokemon/:id`, misma caché en memoria).
 */
export function usePokemonTypes(ids: number[]) {
  const { previews, pending, failed } = usePokemonPreviews(ids);
  const signature = ids.join(",");

  const types = useMemo(() => {
    const result: Record<number, string[]> = {};
    for (const id of ids) {
      const preview = previews[id];
      if (preview) result[id] = preview.types;
    }
    return result;
    // `signature` resume los IDs sin depender de la identidad del array.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [previews, signature]);

  return { types, pending, failed };
}
