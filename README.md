# PokeChile

PokeChile es una Pokédex full-stack con estética chilena: busca Pokémon de forma predictiva, filtra por tipo y generación, revisa estadísticas, sprites, gritos y guarda tus favoritos ("regalones") por entrenador. La ficha de cada Pokémon incluye su cadena evolutiva con las condiciones para evolucionar, una ficha aparte con sus Megaevoluciones cuando existen y una sección de Dinamax y Gigamax con sus formas, movimientos exclusivos y el cálculo de PS según el nivel Dinamax. Incluye un favicon original inspirado en una Poké Ball con los colores y la estrella de la bandera de Chile.

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
| `APP_URL` | backend | URL pública del frontend para armar el enlace de recuperación (si falta, usa `CORS_ORIGIN`) |
| `PASSWORD_RESET_TTL_MINUTES` | backend | Vigencia del enlace de recuperación (30 por defecto) |
| `RESEND_API_KEY` | backend | API key de Resend para enviar el correo de recuperación (opcional) |
| `EMAIL_FROM` | backend | Remitente verificado en Resend, ej. `PokeChile <no-reply@tudominio.cl>` |
| `VITE_API_URL` | frontend | URL pública de la API |

## Cuenta administradora

| Usuario | Contraseña | Rol |
|---|---|---|
| `pablito` | `pablito2026` | Administrador |

El seed crea esta cuenta solo si no existe. Las contraseñas se guardan hasheadas con scrypt y los tokens están firmados y expiran a los 7 días. Cambia la clave desde el panel de administración antes de publicar.

## Panel de administración

Disponible en `/admin` para cuentas con rol `admin`:

- **Entrenadores:** crear, listar, editar (nombre, rol, avatar, email y contraseña) y eliminar cuentas. No permite eliminar la propia cuenta ni dejar el sitio sin administradores.
- **Regalones:** ver los favoritos de todos los entrenadores y crear, editar o eliminar registros.
- **Recuperaciones:** ver las solicitudes de contraseña vigentes y generar un enlace de un solo uso para entregárselo al entrenador (o enviarlo por correo si tiene email registrado).

Al eliminar un entrenador también se eliminan sus regalones.

## API

| Método | Ruta | Descripción |
|---|---|---|
| `GET` | `/health` | Estado del servicio |
| `POST` | `/api/auth/login` | Devuelve usuario y token firmado |
| `POST` | `/api/auth/forgot-password` | Solicita enlace de recuperación (`{ username }`) |
| `POST` | `/api/auth/reset-password` | Cambia la contraseña con un token (`{ token, password }`) |
| `GET` | `/api/pokemon?limit=&offset=` | Listado paginado (incluye tipos y total) |
| `GET` | `/api/pokemon/suggest?q=` | Sugerencias predictivas por nombre o número |
| `GET` | `/api/pokemon/type/:type` | Pokémon por tipo |
| `GET` | `/api/pokemon/generation/:gen` | Pokémon por generación (1-9) |
| `GET` | `/api/pokemon/search/:name` | Búsqueda por nombre |
| `GET` | `/api/pokemon/:id` | Ficha completa (cadena evolutiva, Megaevoluciones y formas Gigamax) |
| `GET` | `/api/favorites` | Favoritos del usuario autenticado |
| `POST` | `/api/favorites` | Agrega favorito (`{ pokemonId, name }`) |
| `DELETE` | `/api/favorites/:pokemonId` | Elimina favorito |
| `GET` | `/api/favorites/:pokemonId/check` | Indica si es favorito |
| `GET` | `/api/admin/users` | Lista entrenadores (solo admin) |
| `POST` | `/api/admin/users` | Crea entrenador (solo admin) |
| `PUT` | `/api/admin/users/:id` | Actualiza entrenador (solo admin) |
| `DELETE` | `/api/admin/users/:id` | Elimina entrenador y sus regalones (solo admin) |
| `GET` | `/api/admin/password-resets` | Solicitudes de recuperación vigentes (solo admin) |
| `POST` | `/api/admin/users/:id/password-reset` | Genera (y envía si hay email) un enlace de recuperación (solo admin) |
| `GET` | `/api/admin/favorites` | Lista regalones de todos (solo admin) |
| `POST` | `/api/admin/favorites` | Crea regalón para un entrenador (solo admin) |
| `PUT` | `/api/admin/favorites/:id` | Actualiza regalón (solo admin) |
| `DELETE` | `/api/admin/favorites/:id` | Elimina regalón (solo admin) |

Las rutas de favoritos requieren `Authorization: Bearer <token>`. Las rutas `/api/admin/*` además exigen rol `admin`, validado contra la base de datos en cada petición.

El flujo completo de recuperación de contraseña (funcionamiento, variables, despliegue y seguridad) está documentado en [`GUIA-RECUPERACION-PASSWORD.md`](GUIA-RECUPERACION-PASSWORD.md).

## Dinamax y Gigamax

La ficha de detalle agrega una sección **Dinamax y Gigamax** después de las Megaevoluciones. Se calcula en el frontend porque PokéAPI no modela la transformación Dinamax: solo existen las formas Gigamax como variedades.

### Reglas que muestra la ficha

- **Disponibilidad:** todos los Pokémon pueden Dinamaxizar salvo Zacian (#888), Zamazenta (#889) y Eternatus (#890). Para esos tres se muestra un aviso y se ocultan los paneles de PS y movimientos.
- **Duración:** 3 turnos; termina antes si el Pokémon cambia o se retira.
- **Frecuencia:** una vez por combate y requiere la Banda Dinamax.
- **Movimientos:** todos los ataques se convierten en el Max Move de su tipo; los movimientos de estado se convierten en Maxibarrera.
- **PS:** se usa el multiplicador `1.5 + 0.05 × nivel`, con nivel Dinamax de 0 a 10 (de ×1,50 a ×2,00). El cálculo es una referencia sobre la estadística base de PS, igual que el resto de la ficha. Shedinja conserva siempre 1 PS.
- **Selector de nivel:** un control deslizante actualiza en vivo los PS resultantes y el multiplicador.

### Formas Gigamax

- Se obtienen de las variedades `-gmax` de la **especie actual**, no de la última evolución. Así Pikachu, Eevee y Meowth pueden mostrar su forma Gigamax aunque puedan evolucionar.
- Cada forma incluye arte oficial, tipos, altura aproximada, disponibilidad y requisito (Factor Gigamax), además de su movimiento G-Max exclusivo.
- **Toxtricity** (Aguda/Grave) y **Urshifu** (Brusca/Fluida) tienen dos formas: se muestran ambas tarjetas y se puede alternar la selección.
- **Eternamax** no es una forma Gigamax obtenible: aparece como tarjeta informativa en la ficha de Eternatus, marcada como forma de jefe no disponible para el jugador.
- Si la especie puede Dinamaxizar pero no tiene forma Gigamax, la sección sigue visible con un aviso que explica que solo 32 especies pueden Gigamaxizar.
- Ese aviso revisa la cadena evolutiva (`gmaxRelatives`): si una preevolución o una evolución posterior sí tiene Factor Gigamax, el mensaje nombra esa etapa en vez de decir que toda la especie no puede. Por ejemplo, Charmeleon avisa que Charizard sí Gigamaxiza y Persian recuerda que Meowth sí podía antes de evolucionar.

### Datos y límites

- PokéAPI no incluye los movimientos G-Max entre sus movimientos y la potencia de los Max Moves viene como valor de relleno. Los **19 Max Moves** genéricos (tipo, nombre y efecto) se mantienen en `frontend/src/utils/maxMoves.ts` porque alimentan el selector visual. Los **34 G-Max Moves** viven en `backend/src/services/gmaxMoves.ts` y llegan adjuntos como `gmaxMove` en cada forma de `gmaxForms`.
- La potencia de los movimientos G-Max depende del movimiento original (90–150); Rillaboom, Cinderace e Inteleon siempre usan 160.
- El peso de las formas Gigamax no se muestra porque PokéAPI entrega `10000` como valor de relleno. La altura se presenta como aproximada ("Más de X m").
- No hay selector shiny para el arte Gigamax en esta versión.

El detalle expone las formas en `gmaxForms` con `id`, `name`, `baseName`, `variant` (solo en formas dobles), `types`, `sprite`, `artwork`, `shinyArtwork`, `height` (en decímetros) y `gmaxMove` (`name`, `type`, `effect` y `fixedPower` opcional). Cuando la especie actual no tiene forma Gigamax, `gmaxRelatives` lista las otras etapas de su cadena que sí la tienen, con `id`, `name` y `direction` (`earlier` o `later`).

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
  src/services/gmaxMoves.ts # catálogo curado de los 34 G-Max Moves
  src/middleware/          # auth por token/rol y manejo de errores
  tests/
frontend/
  src/pages/               # Home, detalle, favoritos, login, tipo y admin
  src/components/admin/    # CRUD de entrenadores y regalones
  src/components/          # buscador predictivo, card, cadena evolutiva, megas, dinamax y filtros
  src/components/forms/    # primitivas compartidas de Megaevoluciones y Gigamax
  src/utils/dynamax.ts     # multiplicador de PS, niveles y restricciones de Dinamax
  src/utils/maxMoves.ts    # Max Moves genéricos y nota de potencia
  src/services/api.ts      # cliente Axios tipado
  src/context/AuthContext  # sesión, rol y localStorage
  public/                  # favicon original (SVG, ICO y PNG)
  tests/
```

## Decisiones y límites conocidos

- **Usuarios en base de datos:** contraseñas con scrypt y tokens HMAC firmados con `AUTH_SECRET`.
- **Recuperación de contraseña:** enlaces de un solo uso, guardados solo como hash SHA-256, con vigencia de 30 minutos (configurable), límite de solicitudes y respuesta genérica para no enumerar cuentas. Si no hay proveedor de correo configurado, el admin genera el enlace desde el panel.
- **Administración por rol:** el rol se valida en el backend contra la base de datos en cada petición; no se confía en datos del cliente.
- **Favoritos aislados por usuario:** el backend deriva el `userId` del token firmado, nunca de un header manipulable.
- **Regalones al eliminar cuentas:** al borrar un entrenador se eliminan también sus regalones.
- **Caché en memoria:** las respuestas de PokéAPI se guardan 10 minutos por proceso. Con varias instancias cada una tiene su propia caché.
- **Dinamax calculado en el cliente:** PokéAPI no expone la transformación ni sus PS; el multiplicador y las restricciones viven en `frontend/src/utils/dynamax.ts`. Las formas Gigamax sí llegan desde la API como variedades de la especie.
- **Movimientos Max y G-Max curados:** PokéAPI no incluye los G-Max Moves y usa potencias de relleno para los Max Moves. Los Max Moves genéricos viven en el frontend; el G-Max Move de cada forma lo resuelve el backend y viaja en `gmaxForms[].gmaxMove`. Ambos catálogos deben revisarse al añadir especies nuevas.
- **Peso Gigamax omitido:** PokéAPI entrega `10000` como peso de relleno; se prefiere no mostrar un dato incorrecto.
- **Listados enriquecidos:** los tipos se obtienen con concurrencia limitada; la primera carga de una generación puede tardar unos segundos y luego queda en caché.
- **Esquema con `db push`:** no hay historial de migraciones; es un proyecto de demostración.
- **Favicon original:** el arte se dibujó desde cero (Poké Ball con paleta y estrella chilena) para no reutilizar fan art ni recursos de terceros. Pokémon y Poké Ball son marcas de Nintendo/Game Freak.
- **Docker Compose levanta servidores de desarrollo:** para producción hay que construir los artefactos y servir el frontend con un servidor estático.
