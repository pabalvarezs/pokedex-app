# PokeChile

PokeChile es una Pokédex full-stack con estética chilena: busca Pokémon de forma predictiva, filtra por tipo y generación, revisa estadísticas, sprites, gritos y guarda tus favoritos ("regalones") por entrenador. La ficha de cada Pokémon incluye su cadena evolutiva con las condiciones para evolucionar y una ficha aparte con sus Megaevoluciones cuando existen. Incluye un favicon original inspirado en una Poké Ball con los colores y la estrella de la bandera de Chile.

## Stack

- **Frontend:** React 18, Vite, TypeScript, Tailwind CSS, TanStack Query, React Router, Axios
- **Backend:** Node.js, Express, TypeScript, Prisma, Axios (proxy/caché de PokéAPI)
- **Base de datos:** PostgreSQL 16
- **Infra local:** Docker Compose

## Inicio rápido con Docker

```bash
cp .env.example .env   # opcional: cambia AUTH_SECRET y credenciales
docker compose up --build
```

- Frontend: http://localhost:5173
- API: http://localhost:5000
- Panel de administración: http://localhost:5173/admin

Al iniciar, el backend aplica el esquema y ejecuta el seed, que crea la cuenta administradora si no existe.

## Desarrollo local

Requisitos: Node.js 20+, PostgreSQL 16 (o el contenedor `postgres` de Compose).

```bash
# 1. Base de datos
docker compose up -d postgres

# 2. Backend
cd backend
cp .env.example .env
npm ci
npx prisma generate
npx prisma db push
npm run seed
npm run dev

# 3. Frontend (otra terminal)
cd frontend
cp .env.example .env
npm ci
npm run dev
```

### Variables de entorno

| Variable | Servicio | Descripción |
|---|---|---|
| `DATABASE_URL` | backend | Conexión PostgreSQL |
| `PORT` | backend | Puerto de la API (5000 por defecto) |
| `AUTH_SECRET` | backend | Secreto para firmar tokens HMAC. **Obligatorio en producción** |
| `CORS_ORIGIN` | backend | Origen permitido (`*` por defecto) |
| `VITE_API_URL` | frontend | URL pública de la API |

## Cuenta administradora

| Usuario | Contraseña | Rol |
|---|---|---|
| `pablito` | `pablito2026` | Administrador |

El seed crea esta cuenta solo si no existe. Las contraseñas se guardan hasheadas con scrypt y los tokens están firmados y expiran a los 7 días. Cambia la clave desde el panel de administración antes de publicar.

## Panel de administración

Disponible en `/admin` para cuentas con rol `admin`:

- **Entrenadores:** crear, listar, editar (nombre, rol, avatar y contraseña) y eliminar cuentas. No permite eliminar la propia cuenta ni dejar el sitio sin administradores.
- **Regalones:** ver los favoritos de todos los entrenadores y crear, editar o eliminar registros.

Al eliminar un entrenador también se eliminan sus regalones.

## API

| Método | Ruta | Descripción |
|---|---|---|
| `GET` | `/health` | Estado del servicio |
| `POST` | `/api/auth/login` | Devuelve usuario y token firmado |
| `GET` | `/api/pokemon?limit=&offset=` | Listado paginado (incluye tipos y total) |
| `GET` | `/api/pokemon/suggest?q=` | Sugerencias predictivas por nombre o número |
| `GET` | `/api/pokemon/type/:type` | Pokémon por tipo |
| `GET` | `/api/pokemon/generation/:gen` | Pokémon por generación (1-9) |
| `GET` | `/api/pokemon/search/:name` | Búsqueda por nombre |
| `GET` | `/api/pokemon/:id` | Ficha completa (cadena evolutiva y Megaevoluciones) |
| `GET` | `/api/favorites` | Favoritos del usuario autenticado |
| `POST` | `/api/favorites` | Agrega favorito (`{ pokemonId, name }`) |
| `DELETE` | `/api/favorites/:pokemonId` | Elimina favorito |
| `GET` | `/api/favorites/:pokemonId/check` | Indica si es favorito |
| `GET` | `/api/admin/users` | Lista entrenadores (solo admin) |
| `POST` | `/api/admin/users` | Crea entrenador (solo admin) |
| `PUT` | `/api/admin/users/:id` | Actualiza entrenador (solo admin) |
| `DELETE` | `/api/admin/users/:id` | Elimina entrenador y sus regalones (solo admin) |
| `GET` | `/api/admin/favorites` | Lista regalones de todos (solo admin) |
| `POST` | `/api/admin/favorites` | Crea regalón para un entrenador (solo admin) |
| `PUT` | `/api/admin/favorites/:id` | Actualiza regalón (solo admin) |
| `DELETE` | `/api/admin/favorites/:id` | Elimina regalón (solo admin) |

Las rutas de favoritos requieren `Authorization: Bearer <token>`. Las rutas `/api/admin/*` además exigen rol `admin`, validado contra la base de datos en cada petición.

## Tests

```bash
# Frontend (sin dependencias externas)
cd frontend
npm test

# Backend: unitarios + integración (requiere PostgreSQL en localhost:5432 y el seed aplicado)
cd backend
npx prisma generate
npx prisma db push
npm run seed
npm test
```

El backend levanta su propio servidor en el puerto 5000 para los tests de integración. Si ya hay uno corriendo, lo reutiliza.

## Estructura

```
backend/
  prisma/schema.prisma     # modelos User y Favorite (userId + pokemonId único)
  prisma/seed.ts           # crea la cuenta administradora
  src/routes/              # definición de endpoints (incluye /api/admin)
  src/controllers/         # validación HTTP
  src/services/            # lógica de negocio, auth, contraseñas y caché de PokéAPI
  src/middleware/          # auth por token/rol y manejo de errores
  tests/
frontend/
  src/pages/               # Home, detalle, favoritos, login, tipo y admin
  src/components/admin/    # CRUD de entrenadores y regalones
  src/components/          # buscador predictivo, card, cadena evolutiva, megas, filtros
  src/services/api.ts      # cliente Axios tipado
  src/context/AuthContext  # sesión, rol y localStorage
  public/                  # favicon original (SVG, ICO y PNG)
  tests/
```

## Decisiones y límites conocidos

- **Usuarios en base de datos:** contraseñas con scrypt y tokens HMAC firmados con `AUTH_SECRET`.
- **Administración por rol:** el rol se valida en el backend contra la base de datos en cada petición; no se confía en datos del cliente.
- **Favoritos aislados por usuario:** el backend deriva el `userId` del token firmado, nunca de un header manipulable.
- **Regalones al eliminar cuentas:** al borrar un entrenador se eliminan también sus regalones.
- **Caché en memoria:** las respuestas de PokéAPI se guardan 10 minutos por proceso. Con varias instancias cada una tiene su propia caché.
- **Listados enriquecidos:** los tipos se obtienen con concurrencia limitada; la primera carga de una generación puede tardar unos segundos y luego queda en caché.
- **Esquema con `db push`:** no hay historial de migraciones; es un proyecto de demostración.
- **Favicon original:** el arte se dibujó desde cero (Poké Ball con paleta y estrella chilena) para no reutilizar fan art ni recursos de terceros. Pokémon y Poké Ball son marcas de Nintendo/Game Freak.
- **Docker Compose levanta servidores de desarrollo:** para producción hay que construir los artefactos y servir el frontend con un servidor estático.
