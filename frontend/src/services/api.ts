import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:5000";

export const api = axios.create({ baseURL: API_URL });

export interface PokemonStat {
  name: string;
  base_stat: number;
}

export interface PokemonAbility {
  name: string;
  is_hidden: boolean;
}

export interface Pokemon {
  id: number;
  name: string;
  types: string[];
  generation?: number;
  sprites?: {
    front_default?: string;
    back_default?: string;
    front_shiny?: string;
    back_shiny?: string;
    other?: {
      "official-artwork"?: {
        front_default?: string;
        front_shiny?: string;
      };
      showdown?: {
        front_default?: string;
        back_default?: string;
        front_shiny?: string;
        back_shiny?: string;
      };
      home?: {
        front_default?: string;
        front_shiny?: string;
      };
    };
    [key: string]: any;
  };
  height?: number;
  weight?: number;
  base_experience?: number;
  stats?: PokemonStat[];
  abilities?: PokemonAbility[];
  moves?: string[];
  cries?: { latest?: string; legacy?: string };
  description?: string;
}

export interface Favorite {
  id: number;
  pokemonId: number;
  name: string;
  createdAt: string;
}

export interface User {
  id: number;
  username: string;
  name: string;
  role: string;
  avatar: string;
}

export async function loginUser(username: string, password: string): Promise<User> {
  const { data } = await api.post("/api/auth/login", { username, password });
  if (data.success && data.user) {
    localStorage.setItem("pokedex_user", JSON.stringify(data.user));
    localStorage.setItem("pokedex_token", data.token);
    return data.user;
  }
  throw new Error(data.error || "Error al iniciar sesión");
}

export function getCurrentUser(): User | null {
  try {
    const raw = localStorage.getItem("pokedex_user");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function logoutUser(): void {
  localStorage.removeItem("pokedex_user");
  localStorage.removeItem("pokedex_token");
}

export async function listPokemon(limit = 20, offset = 0) {
  const { data } = await api.get<{ pokemon: Pokemon[]; limit: number; offset: number }>(
    "/api/pokemon", { params: { limit, offset } }
  );
  return data;
}

export async function listPokemonByType(type: string) {
  const { data } = await api.get<{ pokemon: Pokemon[]; total: number; type: string }>(
    `/api/pokemon/type/${encodeURIComponent(type.toLowerCase())}`
  );
  return data;
}

export async function listPokemonByGeneration(gen: number) {
  const { data } = await api.get<{ pokemon: Pokemon[]; total: number; generation: number }>(
    `/api/pokemon/generation/${gen}`
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
