import axios from "axios";

const POKEAPI = "https://pokeapi.co/api/v2";
const api = axios.create({ baseURL: POKEAPI, timeout: 10000 });

export interface PokemonSummary {
  id: number;
  name: string;
  url: string;
}

interface PokemonTypeSlot {
  type: { name: string };
}

interface PokemonApiResponse {
  id: number;
  name: string;
  types: PokemonTypeSlot[];
  sprites: Record<string, string>;
  height: number;
  weight: number;
}

export interface Pokemon {
  id: number;
  name: string;
  types: string[];
  generation?: number;
  sprites?: Record<string, string>;
  height?: number;
  weight?: number;
}

export async function listPokemon(limit = 20, offset = 0) {
  const { data } = await api.get<{ results: PokemonSummary[] }>("/pokemon", {
    params: { limit, offset },
  });
  return data.results.map((p) => ({
    id: Number(p.url.split("/").filter(Boolean).pop()),
    name: p.name,
    url: p.url,
  }));
}

export async function searchPokemon(name: string) {
  const { data } = await api.get<PokemonApiResponse>(
    `/pokemon/${name.toLowerCase()}`
  );
  return {
    id: data.id,
    name: data.name,
    types: data.types.map((t) => t.type.name),
    generation: 1,
    sprites: data.sprites,
  };
}

export async function getPokemonById(id: number) {
  const { data } = await api.get<PokemonApiResponse>(`/pokemon/${id}`);
  return {
    id: data.id,
    name: data.name,
    types: data.types.map((t) => t.type.name),
    sprites: data.sprites,
    height: data.height,
    weight: data.weight,
  };
}
