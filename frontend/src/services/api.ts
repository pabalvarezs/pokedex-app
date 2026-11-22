import axios from "axios";
import type {
  DataCenterPokemonResponse,
  DataCenterRefreshResponse,
  PokemonDataCenterFilters,
} from "../features/dataCenter/lib/types";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:5000";

export const api = axios.create({ baseURL: API_URL });

// Interceptor: adjunta el token firmado de la sesión activa
api.interceptors.request.use((config) => {
  try {
    const token = localStorage.getItem("pokedex_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
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

export interface EvolutionMember {
  id: number;
  name: string;
  condition?: string;
}

export interface EvolutionStage {
  members: EvolutionMember[];
}

export interface MegaForm {
  id: number;
  name: string;
  baseName: string;
  variant?: string;
  types: string[];
  sprite?: string;
  artwork?: string;
}

export interface GmaxMove {
  name: string;
  type: string;
  effect: string;
  /** Rillaboom, Cinderace e Inteleon siempre tienen 160 de potencia. */
  fixedPower?: boolean;
}

export interface GmaxForm {
  id: number;
  name: string;
  baseName: string;
  /** Etiqueta para las especies con más de una forma: Aguda, Grave, Brusca o Fluida. */
  variant?: string;
  types: string[];
  sprite?: string;
  artwork?: string;
  shinyArtwork?: string;
  /** Altura en decímetros, como la entrega PokeAPI. */
  height?: number;
  /** Movimiento G-Max exclusivo que entrega la API. */
  gmaxMove?: GmaxMove;
}

/** Etapa de la cadena que puede Gigamaxizar cuando la especie actual no puede. */
export interface GmaxRelative {
  id: number;
  name: string;
  /** "earlier" para una preevolución y "later" para una evolución posterior. */
  direction: "earlier" | "later";
}

export interface PokemonVariantCategory {
  key: string;
  label: string;
  shortLabel: string;
  description: string;
  emoji: string;
  tone: string;
  section: string;
}

export interface PokemonVariant {
  id: number;
  name: string;
  displayName: string;
  category: PokemonVariantCategory;
  description: string;
  condition?: string;
  region?: string;
  permanence: string;
  affects: string;
  availability: string;
  kind: string;
  navigable: boolean;
  order: number;
  isDefault: boolean;
  isCurrent: boolean;
  sprite: string;
  artwork: string;
  types?: string[];
}

export interface ParadoxRelative {
  id: number;
  name: string;
  displayName: string;
  era: "past" | "future";
  description: string;
  sprite: string;
  artwork: string;
  types: string[];
}

export interface PokemonVariantFamily {
  speciesId: number;
  speciesName: string;
  baseId: number;
  baseName: string;
  baseDisplayName: string;
  baseSprite: string;
  baseArtwork: string;
  baseTypes?: string[];
  currentId: number;
  currentName: string;
  currentDisplayName: string;
  currentCategory?: PokemonVariantCategory;
  isDefault: boolean;
  total: number;
  variants: PokemonVariant[];
  /** Pokémon paradoja relacionados por lore. */
  paradoxRelatives?: ParadoxRelative[];
}

export interface Pokemon {
  id: number;
  name: string;
  speciesId?: number;
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
  evolutionChain?: EvolutionStage[];
  /** Variedad resaltada en la cadena (forma base si se ve una Mega). */
  evolutionCurrentId?: number;
  megaForms?: MegaForm[];
  gmaxForms?: GmaxForm[];
  /** Otras etapas de la cadena que sí pueden Gigamaxizar. */
  gmaxRelatives?: GmaxRelative[];
  /** Familia de variantes y formas de la especie. */
  variantFamily?: PokemonVariantFamily;
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
  try {
    const { data } = await api.post("/api/auth/login", { username, password });
    if (data.success && data.user) {
      localStorage.setItem("pokedex_user", JSON.stringify(data.user));
      localStorage.setItem("pokedex_token", data.token);
      return data.user;
    }
    throw new Error(data.error || "Error al iniciar sesión");
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.error || "Error al iniciar sesión");
    }
    throw error;
  }
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

// --- Recuperación de contraseña ---

export interface ForgotPasswordResponse {
  success: boolean;
  message: string;
  /** Solo se incluye en desarrollo para probar el flujo sin proveedor de correo. */
  devResetUrl?: string;
}

export async function requestPasswordReset(username: string): Promise<ForgotPasswordResponse> {
  try {
    const { data } = await api.post<ForgotPasswordResponse>("/api/auth/forgot-password", {
      username,
    });
    return data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "No pudimos procesar la solicitud."));
  }
}

export async function resetPassword(
  token: string,
  password: string
): Promise<{ success: boolean; message: string }> {
  try {
    const { data } = await api.post<{ success: boolean; message: string }>(
      "/api/auth/reset-password",
      { token, password }
    );
    return data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "No pudimos actualizar tu contraseña."));
  }
}

export async function listPokemon(limit = 20, offset = 0) {
  const { data } = await api.get<{
    pokemon: Pokemon[];
    total: number;
    limit: number;
    offset: number;
  }>("/api/pokemon", { params: { limit, offset } });
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

export interface PokemonSuggestion {
  id: number;
  name: string;
}

export async function suggestPokemon(query: string, limit = 8) {
  const { data } = await api.get<{ suggestions: PokemonSuggestion[]; query: string }>(
    "/api/pokemon/suggest",
    { params: { q: query, limit } }
  );
  return data.suggestions;
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

// --- Administración ---

export interface AdminUser {
  id: number;
  username: string;
  name: string;
  role: "admin" | "trainer";
  avatar: string;
  email: string | null;
  createdAt: string;
  updatedAt: string;
  /** Opcional: el backend aún no lo expone, se muestra solo si llega. */
  last_login_at?: string | null;
  lastLoginAt?: string | null;
  last_login?: string | null;
}

export interface AdminUserInput {
  username?: string;
  password?: string;
  name: string;
  role: "admin" | "trainer";
  avatar?: string;
  email?: string | null;
}

export interface PasswordResetRequest {
  id: number;
  userId: number;
  username: string;
  name: string;
  email: string | null;
  source: string;
  createdAt: string;
  expiresAt: string;
}

export interface GeneratedPasswordReset {
  username: string;
  url: string;
  expiresAt: string;
  hasEmail: boolean;
  emailSent: boolean;
}

export interface AdminFavorite {
  id: number;
  userId: string;
  pokemonId: number;
  name: string;
  createdAt: string;
}

export interface AdminFavoriteInput {
  userId: string;
  pokemonId: number;
  name: string;
}

export function getApiErrorMessage(error: unknown, fallback = "Ocurrió un error inesperado."): string {
  const err = error as { response?: { data?: { error?: string } }; message?: string };
  return err?.response?.data?.error ?? err?.message ?? fallback;
}

export async function adminListUsers() {
  const { data } = await api.get<AdminUser[]>("/api/admin/users");
  return data;
}

export async function adminCreateUser(input: AdminUserInput & { username: string; password: string }) {
  const { data } = await api.post<AdminUser>("/api/admin/users", input);
  return data;
}

export async function adminUpdateUser(id: number, input: Omit<AdminUserInput, "username">) {
  const { data } = await api.put<AdminUser>(`/api/admin/users/${id}`, input);
  return data;
}

export async function adminDeleteUser(id: number) {
  await api.delete(`/api/admin/users/${id}`);
}

export async function adminListPasswordResets() {
  const { data } = await api.get<PasswordResetRequest[]>("/api/admin/password-resets");
  return data;
}

export async function adminCreatePasswordReset(userId: number) {
  const { data } = await api.post<GeneratedPasswordReset>(
    `/api/admin/users/${userId}/password-reset`
  );
  return data;
}

export async function adminListFavorites() {
  const { data } = await api.get<AdminFavorite[]>("/api/admin/favorites");
  return data;
}

export async function adminCreateFavorite(input: AdminFavoriteInput) {
  const { data } = await api.post<AdminFavorite>("/api/admin/favorites", input);
  return data;
}

export async function adminUpdateFavorite(id: number, input: Partial<AdminFavoriteInput>) {
  const { data } = await api.put<AdminFavorite>(`/api/admin/favorites/${id}`, input);
  return data;
}

export async function adminDeleteFavorite(id: number) {
  await api.delete(`/api/admin/favorites/${id}`);
}

// --- Centro de Datos (solo administradores) ---

export async function getDataCenterPokemon(filters: PokemonDataCenterFilters) {
  const { data } = await api.get<DataCenterPokemonResponse>(
    "/api/admin/data-center/pokemon",
    {
      params: {
        limit: filters.limit,
        type: filters.type ?? undefined,
        generation: filters.generation ?? undefined,
        variants: filters.includeVariants,
      },
    }
  );
  return data;
}

export async function refreshDataCenterPokemon() {
  const { data } = await api.post<DataCenterRefreshResponse>(
    "/api/admin/data-center/pokemon/refresh"
  );
  return data;
}
