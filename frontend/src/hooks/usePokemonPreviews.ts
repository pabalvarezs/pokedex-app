import { useEffect, useMemo, useState } from "react";
import { getPokemon, type PokemonStat } from "../services/api";

/**
 * Resumen liviano de un Pokémon que ya viene en la ficha (tipos y stats).
 * Se cachea en memoria para no repetir consultas al navegar por la cadena o
 * al alternar entre Megaevoluciones.
 */
export interface PokemonPreview {
  id: number;
  name: string;
  types: string[];
  stats: PokemonStat[];
  artwork?: string;
}

export interface PokemonPreviewsResult {
  previews: Record<number, PokemonPreview>;
  pending: boolean;
  failed: boolean;
}

const previewCache = new Map<number, PokemonPreview>();
const previewPending = new Map<number, Promise<void>>();
const previewFailed = new Set<number>();

function rememberPreview(id: number, pokemon: Awaited<ReturnType<typeof getPokemon>>) {
  previewCache.set(id, {
    id: pokemon.id,
    name: pokemon.name,
    types: pokemon.types ?? [],
    stats: pokemon.stats ?? [],
    artwork:
      pokemon.sprites?.other?.["official-artwork"]?.front_default ??
      pokemon.sprites?.front_default,
  });
  previewFailed.delete(id);
}

function loadPreview(id: number): Promise<void> {
  if (previewCache.has(id)) return Promise.resolve();

  const pending = previewPending.get(id);
  if (pending) return pending;

  const request = getPokemon(id)
    .then((pokemon) => rememberPreview(id, pokemon))
    .catch(() => {
      // Sin datos extra: las tarjetas siguen funcionando con lo que entrega
      // la cadena evolutiva. No inventamos tipos ni estadísticas.
      previewFailed.add(id);
    })
    .finally(() => {
      previewPending.delete(id);
    });

  previewPending.set(id, request);
  return request;
}

/**
 * Consulta, en segundo plano y con concurrencia limitada, la ficha de los
 * Pokémon de la cadena para mostrar sus tipos. Usa el endpoint existente y
 * conserva la respuesta en memoria durante la sesión.
 */
export function usePokemonPreviews(ids: number[]): PokemonPreviewsResult {
  const signature = ids.join(",");
  const [version, setVersion] = useState(0);

  useEffect(() => {
    const unique = Array.from(new Set(ids)).filter((id) => Number.isInteger(id) && id > 0);
    if (unique.length === 0) return;
    if (unique.every((id) => previewCache.has(id))) return;

    let cancelled = false;

    (async () => {
      for (let index = 0; index < unique.length; index += 3) {
        await Promise.all(unique.slice(index, index + 3).map(loadPreview));
        if (cancelled) return;
        setVersion((current) => current + 1);
      }
    })();

    return () => {
      cancelled = true;
    };
    // La firma resume los IDs reales y evita repetir el efecto en cada render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [signature]);

  return useMemo(() => {
    const previews: Record<number, PokemonPreview> = {};
    for (const id of ids) {
      const preview = previewCache.get(id);
      if (preview) previews[id] = preview;
    }

    const pending = ids.some(
      (id) =>
        previewPending.has(id) ||
        (!previewCache.has(id) && !previewFailed.has(id))
    );

    return {
      previews,
      pending,
      failed: ids.some((id) => previewFailed.has(id)),
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [signature, version]);
}
