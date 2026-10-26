# Pokédex

Pokédex full-stack con estética chilena: explora Pokémon, filtra por tipo y generación, revisa estadísticas, sprites, gritos y guarda tus favoritos ("regalones") por entrenador.

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

## Credenciales de demostración

| Usuario | Contraseña |
|---|---|
| `pablito` | `pablito2026` |
| `admin` | `admin123` |

> La autenticación es de demostración: las credenciales están en el código y no existe tabla de usuarios. Los tokens sí están firmados y expiran a los 7 días. Cámbialo antes de publicar.

## API

| Método | Ruta | Descripción |
|---|---|---|
| `GET` | `/health` | Estado del servicio |
| `POST` | `/api/auth/login` | Devuelve usuario y token firmado |
| `GET` | `/api/auth/credentials` | Credenciales de prueba |
| `GET` | `/api/pokemon?limit=&offset=` | Listado paginado (incluye tipos y total) |
| `GET` | `/api/pokemon/type/:type` | Pokémon por tipo |
| `GET` | `/api/pokemon/generation/:gen` | Pokémon por generación (1-9) |
| `GET` | `/api/pokemon/search/:name` | Búsqueda por nombre |
| `GET` | `/api/pokemon/:id` | Ficha completa |
| `GET` | `/api/favorites` | Favoritos del usuario autenticado |
| `POST` | `/api/favorites` | Agrega favorito (`{ pokemonId, name }`) |
| `DELETE` | `/api/favorites/:pokemonId` | Elimina favorito |
| `GET` | `/api/favorites/:pokemonId/check` | Indica si es favorito |

Las rutas de favoritos requieren `Authorization: Bearer <token>`.

## Tests

```bash
# Frontend (sin dependencias externas)
cd frontend
npm test

# Backend: unitarios + integración (requiere PostgreSQL en localhost:5432)
cd backend
npx prisma generate
npx prisma db push
npm test
```

El backend levanta su propio servidor en el puerto 5000 para los tests de integración. Si ya hay uno corriendo, lo reutiliza.

## Estructura

```
backend/
  prisma/schema.prisma     # modelo Favorite (userId + pokemonId único)
  src/routes/              # definición de endpoints
  src/controllers/         # validación HTTP
  src/services/            # lógica de negocio, Prisma y caché de PokéAPI
  src/middleware/          # auth por token y manejo de errores
  tests/
frontend/
  src/pages/               # Home, detalle, favoritos, login, tipo
  src/components/          # card, botón de favorito, filtros
  src/services/api.ts      # cliente Axios tipado
  src/context/AuthContext  # sesión y localStorage
  tests/
```

## Decisiones y límites conocidos

- **Favoritos aislados por usuario:** el backend deriva el `userId` del token firmado, nunca de un header manipulable.
- **Caché en memoria:** las respuestas de PokéAPI se guardan 10 minutos por proceso. Con varias instancias cada una tiene su propia caché.
- **Listados enriquecidos:** los tipos se obtienen con concurrencia limitada; la primera carga de una generación puede tardar unos segundos y luego queda en caché.
- **Esquema con `db push`:** no hay historial de migraciones; es un proyecto de demostración.
- **Docker Compose levanta servidores de desarrollo:** para producción hay que construir los artefactos y servir el frontend con un servidor estático.
