import { Request, Response } from "express";
import { createToken } from "../services/auth";
import { verifyPassword } from "../services/password";
import { findByUsername, toPublicUser } from "../services/users";

export async function login(req: Request, res: Response) {
  const { username, password } = req.body || {};

  if (!username || !password) {
    res.status(400).json({
      success: false,
      error: "Debes ingresar tu usuario y contraseña.",
    });
    return;
  }

  const cleanUser = String(username).trim().toLowerCase();
  const cleanPass = String(password).trim();

  const user = await findByUsername(cleanUser);
  if (!user || !verifyPassword(cleanPass, user.passwordHash)) {
    res.status(401).json({
      success: false,
      error: "Usuario o contraseña incorrectos.",
    });
    return;
  }

  const publicUser = toPublicUser(user);

  res.json({
    success: true,
    message: "¡Bienvenido a PokeChile!",
    user: {
      id: publicUser.id,
      username: publicUser.username,
      name: publicUser.name,
      role: publicUser.role,
      avatar: publicUser.avatar,
    },
    token: createToken(publicUser.username),
  });
}
