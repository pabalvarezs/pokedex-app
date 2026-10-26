import { prisma } from "./prisma";
import { hashPassword } from "./password";

export type UserRole = "admin" | "trainer";

export interface PublicUser {
  id: number;
  username: string;
  name: string;
  role: UserRole;
  avatar: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface UserInput {
  username: string;
  password?: string;
  name: string;
  role?: string;
  avatar?: string;
}

export const DEFAULT_AVATAR =
  "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/25.png";

export function normalizeRole(role: unknown): UserRole {
  return role === "admin" ? "admin" : "trainer";
}

export function toPublicUser(user: {
  id: number;
  username: string;
  name: string;
  role: string;
  avatar: string;
  createdAt?: Date;
  updatedAt?: Date;
}): PublicUser {
  return {
    id: user.id,
    username: user.username,
    name: user.name,
    role: normalizeRole(user.role),
    avatar: user.avatar,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

export async function findByUsername(username: string) {
  return prisma.user.findUnique({ where: { username: username.toLowerCase() } });
}

export async function findById(id: number) {
  return prisma.user.findUnique({ where: { id } });
}

export async function listUsers(): Promise<PublicUser[]> {
  const users = await prisma.user.findMany({ orderBy: { createdAt: "asc" } });
  return users.map(toPublicUser);
}

export async function countAdmins(): Promise<number> {
  return prisma.user.count({ where: { role: "admin" } });
}

export async function createUser(input: UserInput): Promise<PublicUser> {
  const user = await prisma.user.create({
    data: {
      username: input.username.toLowerCase(),
      passwordHash: hashPassword(input.password ?? ""),
      name: input.name,
      role: normalizeRole(input.role),
      avatar: input.avatar || DEFAULT_AVATAR,
    },
  });
  return toPublicUser(user);
}

export async function updateUser(id: number, input: Partial<UserInput>): Promise<PublicUser> {
  const data: Record<string, unknown> = {};

  if (input.name !== undefined) data.name = input.name;
  if (input.role !== undefined) data.role = normalizeRole(input.role);
  if (input.avatar !== undefined) data.avatar = input.avatar || DEFAULT_AVATAR;
  if (input.password) data.passwordHash = hashPassword(input.password);

  const user = await prisma.user.update({ where: { id }, data });
  return toPublicUser(user);
}

export async function deleteUser(id: number) {
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) return null;

  // Los regalones se guardan por username: se eliminan junto con la cuenta.
  await prisma.$transaction([
    prisma.favorite.deleteMany({ where: { userId: user.username } }),
    prisma.user.delete({ where: { id } }),
  ]);

  return toPublicUser(user);
}

export async function ensureAdminSeed() {
  const username = "pablito";
  const existing = await findByUsername(username);
  if (existing) {
    if (existing.role !== "admin") {
      await prisma.user.update({ where: { id: existing.id }, data: { role: "admin" } });
    }
    return existing;
  }

  return prisma.user.create({
    data: {
      username,
      passwordHash: hashPassword("pablito2026"),
      name: "Pablito",
      role: "admin",
      avatar: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/25.png",
    },
  });
}
