import { Request, Response } from "express";
import * as usersService from "../services/users";
import * as favoritesService from "../services/favorites";

function parseId(value: string): number | null {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
}

function isUniqueError(error: unknown): boolean {
  return typeof error === "object" && error !== null && (error as { code?: string }).code === "P2002";
}

function isNotFoundError(error: unknown): boolean {
  return typeof error === "object" && error !== null && (error as { code?: string }).code === "P2025";
}

function cleanText(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

// --- Entrenadores ---

export async function listUsers(_req: Request, res: Response) {
  const users = await usersService.listUsers();
  res.json(users);
}

export async function createUser(req: Request, res: Response) {
  const username = cleanText(req.body?.username).toLowerCase();
  const password = typeof req.body?.password === "string" ? req.body.password : "";
  const name = cleanText(req.body?.name);
  const role = req.body?.role;
  const avatar = cleanText(req.body?.avatar);

  if (!/^[a-z0-9_.-]{3,30}$/.test(username)) {
    res.status(400).json({
      error: "El usuario debe tener entre 3 y 30 caracteres (letras, números, punto, guion o guion bajo).",
    });
    return;
  }
  if (password.length < 6) {
    res.status(400).json({ error: "La contraseña debe tener al menos 6 caracteres." });
    return;
  }
  if (!name) {
    res.status(400).json({ error: "El nombre del entrenador es obligatorio." });
    return;
  }

  try {
    const user = await usersService.createUser({ username, password, name, role, avatar });
    res.status(201).json(user);
  } catch (error) {
    if (isUniqueError(error)) {
      res.status(409).json({ error: "Ya existe un entrenador con ese nombre de usuario." });
      return;
    }
    throw error;
  }
}

export async function updateUser(req: Request, res: Response) {
  const id = parseId(req.params.id);
  if (!id) {
    res.status(400).json({ error: "ID de entrenador inválido." });
    return;
  }

  const target = await usersService.findById(id);
  if (!target) {
    res.status(404).json({ error: "Entrenador no encontrado." });
    return;
  }

  const name = req.body?.name !== undefined ? cleanText(req.body.name) : undefined;
  const password = typeof req.body?.password === "string" ? req.body.password : undefined;
  const role = req.body?.role !== undefined ? usersService.normalizeRole(req.body.role) : undefined;
  const avatar = req.body?.avatar !== undefined ? cleanText(req.body.avatar) : undefined;

  if (name !== undefined && !name) {
    res.status(400).json({ error: "El nombre del entrenador es obligatorio." });
    return;
  }
  if (password !== undefined && password !== "" && password.length < 6) {
    res.status(400).json({ error: "La contraseña debe tener al menos 6 caracteres." });
    return;
  }
  if (role && target.role === "admin" && role !== "admin") {
    const admins = await usersService.countAdmins();
    if (admins <= 1) {
      res.status(400).json({ error: "Debe quedar al menos un administrador en el sitio." });
      return;
    }
  }

  try {
    const user = await usersService.updateUser(id, { name, password, role, avatar });
    res.json(user);
  } catch (error) {
    if (isNotFoundError(error)) {
      res.status(404).json({ error: "Entrenador no encontrado." });
      return;
    }
    throw error;
  }
}

export async function deleteUser(req: Request, res: Response) {
  const id = parseId(req.params.id);
  if (!id) {
    res.status(400).json({ error: "ID de entrenador inválido." });
    return;
  }

  const target = await usersService.findById(id);
  if (!target) {
    res.status(404).json({ error: "Entrenador no encontrado." });
    return;
  }

  if (target.username === req.userId) {
    res.status(400).json({ error: "No puedes eliminar tu propia cuenta de administrador." });
    return;
  }

  if (target.role === "admin") {
    const admins = await usersService.countAdmins();
    if (admins <= 1) {
      res.status(400).json({ error: "Debe quedar al menos un administrador en el sitio." });
      return;
    }
  }

  const deleted = await usersService.deleteUser(id);
  if (!deleted) {
    res.status(404).json({ error: "Entrenador no encontrado." });
    return;
  }
  res.status(204).send();
}

// --- Regalones (favoritos) de todos los entrenadores ---

export async function listFavorites(_req: Request, res: Response) {
  const favorites = await favoritesService.listAllFavorites();
  res.json(favorites);
}

export async function createFavorite(req: Request, res: Response) {
  const userId = cleanText(req.body?.userId).toLowerCase();
  const pokemonId = Number(req.body?.pokemonId);
  const name = cleanText(req.body?.name);

  if (!userId) {
    res.status(400).json({ error: "Debes indicar el entrenador dueño del regalón." });
    return;
  }
  if (!Number.isInteger(pokemonId) || pokemonId <= 0) {
    res.status(400).json({ error: "El ID del Pokémon debe ser un número positivo." });
    return;
  }
  if (!name) {
    res.status(400).json({ error: "El nombre del Pokémon es obligatorio." });
    return;
  }

  const owner = await usersService.findByUsername(userId);
  if (!owner) {
    res.status(404).json({ error: "El entrenador indicado no existe." });
    return;
  }

  try {
    const favorite = await favoritesService.addFavorite({ userId, pokemonId, name });
    res.status(201).json(favorite);
  } catch (error) {
    if (isUniqueError(error)) {
      res.status(409).json({ error: "Ese entrenador ya tiene ese Pokémon como regalón." });
      return;
    }
    throw error;
  }
}

export async function updateFavorite(req: Request, res: Response) {
  const id = parseId(req.params.id);
  if (!id) {
    res.status(400).json({ error: "ID de regalón inválido." });
    return;
  }

  const userId = req.body?.userId !== undefined ? cleanText(req.body.userId).toLowerCase() : undefined;
  const pokemonId = req.body?.pokemonId !== undefined ? Number(req.body.pokemonId) : undefined;
  const name = req.body?.name !== undefined ? cleanText(req.body.name) : undefined;

  if (userId !== undefined) {
    if (!userId) {
      res.status(400).json({ error: "El entrenador dueño del regalón es obligatorio." });
      return;
    }
    const owner = await usersService.findByUsername(userId);
    if (!owner) {
      res.status(404).json({ error: "El entrenador indicado no existe." });
      return;
    }
  }
  if (pokemonId !== undefined && (!Number.isInteger(pokemonId) || pokemonId <= 0)) {
    res.status(400).json({ error: "El ID del Pokémon debe ser un número positivo." });
    return;
  }
  if (name !== undefined && !name) {
    res.status(400).json({ error: "El nombre del Pokémon es obligatorio." });
    return;
  }

  try {
    const favorite = await favoritesService.updateFavorite(id, { userId, pokemonId, name });
    res.json(favorite);
  } catch (error) {
    if (isNotFoundError(error)) {
      res.status(404).json({ error: "Regalón no encontrado." });
      return;
    }
    if (isUniqueError(error)) {
      res.status(409).json({ error: "Ese entrenador ya tiene ese Pokémon como regalón." });
      return;
    }
    throw error;
  }
}

export async function deleteFavorite(req: Request, res: Response) {
  const id = parseId(req.params.id);
  if (!id) {
    res.status(400).json({ error: "ID de regalón inválido." });
    return;
  }

  const deleted = await favoritesService.deleteFavoriteById(id);
  if (!deleted) {
    res.status(404).json({ error: "Regalón no encontrado." });
    return;
  }
  res.status(204).send();
}
