import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:5000";

export const api = axios.create({ baseURL: API_URL });

export interface Pokemon {
  id: number;
  name: string;
  types: string[];
  generation?: number;
  sprites?: Record<string, string>;
  height?: number;
  weight?: number;
}

export interface Favorite {
  id: number;
  pokemonId: number;
  name: string;
  createdAt: string;
}

export async function listPokemon(limit = 20, offset = 0) {
  const { data } = await api.get<{ pokemon: Pokemon[]; limit: number; offset: number }>(
    "/api/pokemon", { params: { limit, offset } }
  );
  return data;
}

export async function getPokemon(id: number) {
  const { data } = await api.get<Pokemon>(`/api/pokemon/${id}`);
  return data;
}

export async function searchPokemon(name: string) {
  const { data } = await api.get<Pokemon>(`/api/pokemon/search/${encodeURIComponent(name)}`);
  return data;
}

export async function listFavorites() {
  const { data } = await api.get<Favorite[]>("/api/favorites");
  return data;
}

export async function addFavorite(pokemonId: number, name: string) {
  const { data } = await api.post<Favorite>("/api/favorites", { pokemonId, name });
  return data;
}

export async function removeFavorite(pokemonId: number) {
  await api.delete(`/api/favorites/${pokemonId}`);
}

export async function isFavorite(pokemonId: number) {
  const { data } = await api.get<{ favorite: boolean }>(`/api/favorites/${pokemonId}/check`);
  return data.favorite;
}
