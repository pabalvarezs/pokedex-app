import { Request, Response } from "express";

export const TEST_CREDENTIALS = {
  username: "pablito",
  password: "pablito2026",
  name: "Pablito",
  role: "Maestro Pokémon",
  avatar: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/25.png",
};

export async function login(req: Request, res: Response) {
  const { username, password } = req.body || {};

  if (!username || !password) {
    res.status(400).json({
      success: false,
      error: "Debes ingresar tu usuario y contraseña, po.",
    });
    return;
  }

  const cleanUser = String(username).trim().toLowerCase();
  const cleanPass = String(password).trim();

  if (
    (cleanUser === TEST_CREDENTIALS.username && cleanPass === TEST_CREDENTIALS.password) ||
    (cleanUser === "admin" && cleanPass === "admin123")
  ) {
    res.json({
      success: true,
      message: "¡Bienvenido a la Pokédex, compadre!",
      user: {
        id: 1,
        username: cleanUser,
        name: cleanUser === "admin" ? "Administrador" : TEST_CREDENTIALS.name,
        role: TEST_CREDENTIALS.role,
        avatar: TEST_CREDENTIALS.avatar,
      },
      token: `pokedex-token-${cleanUser}-${Date.now()}`,
    });
    return;
  }

  res.status(401).json({
    success: false,
    error: "¡Pucha compadre! Usuario o clave incorrecta. Prueba con las credenciales de prueba.",
  });
}

export async function getCredentialsInfo(_req: Request, res: Response) {
  res.json({
    testUser: TEST_CREDENTIALS.username,
    testPassword: TEST_CREDENTIALS.password,
    name: TEST_CREDENTIALS.name,
  });
}
