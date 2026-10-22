import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:5000";

export const api = axios.create({ baseURL: API_URL });

// Interceptor: añade x-user-id solo si hay usuario autenticado (username + token)
api.interceptors.request.use((config) => {
  try {
    const userRaw = localStorage.getItem("pokedex_user");
    const tokenRaw = localStorage.getItem("pokedex_token");
    
    // Solo establecer header si hay ambos: usuario Y token de sesión activa
    if (userRaw && tokenRaw) {
      const user = JSON.parse(userRaw);
      if (user?.username) {
        config.headers["x-user-id"] = user.username;
      }
    }
  } catch {}
  return config;
});

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

export async function listFavorites(userId: string | undefined) {
  if (!userId) return [];
  const { data } = await api.get<Favorite[]>(`/api/favorites?userId=${userId}`);
  return data;
}

export async function addFavorite(pokemonId: number, name: string, userId: string) {
  const { data } = await api.post<Favorite>("/api/favorites", { pokemonId, name, userId });
  return data;
}

export async function removeFavorite(pokemonId: number, userId: string) {
  await api.delete(`/api/favorites/${pokemonId}?userId=${userId}`);
}

export async function isFavorite(pokemonId: number, userId: string) {
  const { data } = await api.get<{ favorite: boolean }>(`/api/favorites/${pokemonId}/check?userId=${userId}`);
  return data.favorite;
}

export interface PokemonFilter {
  type?: string;
  gen?: number;
  sort?: "id" | "name" | "hp" | "attack" | "speed";
}

export async function listPokemonFiltered(filter: PokemonFilter) {
  let pokemon: Pokemon[] = [];

  if (filter.type && filter.gen) {
    // Ambos filtros: busca por tipo y luego filtra por gen en frontend
    const typeData = await listPokemonByType(filter.type);
    const genData = await listPokemonByGeneration(filter.gen!);
    const genIds = new Set(genData.pokemon.map((p) => p.id));
    pokemon = typeData.pokemon.filter((p) => genIds.has(p.id));
  } else if (filter.type) {
    const data = await listPokemonByType(filter.type);
    pokemon = data.pokemon;
  } else if (filter.gen) {
    const data = await listPokemonByGeneration(filter.gen);
    pokemon = data.pokemon;
  } else {
    const data = await listPokemon(250, 0);
    pokemon = data.pokemon;
  }

  // Ordenamiento
  if (filter.sort === "name") {
    pokemon = [...pokemon].sort((a, b) => a.name.localeCompare(b.name));
  } else if (filter.sort === "id") {
    pokemon = [...pokemon].sort((a, b) => a.id - b.id);
  }
  // Para sort por stats (hp, attack, speed) no hay datos disponibles en el listado básico
  // así que solo aplicamos id y name

  return { pokemon, total: pokemon.length };
}
