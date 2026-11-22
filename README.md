# PokeChile

PokeChile es una Pokédex full-stack con estética chilena: busca Pokémon de forma predictiva, filtra por tipo y generación, revisa estadísticas, sprites, gritos y guarda tus favoritos ("regalones") por entrenador. La ficha de cada Pokémon incluye su cadena evolutiva con las condiciones para evolucionar, una ficha aparte con sus Megaevoluciones cuando existen y una sección de Dinamax y Gigamax con sus formas, movimientos exclusivos y el cálculo de PS según el nivel Dinamax. Incluye un favicon original inspirado en una Poké Ball con los colores y la estrella de la bandera de Chile.

## Stack

- **Frontend:** React 18, Vite, TypeScript, Tailwind CSS, TanStack Query, React Router, Axios, Framer Motion (LazyMotion), Sonner, Recharts
- **UI y formularios:** clsx + tailwind-merge, react-hook-form + zod (@hookform/resolvers), lucide-react
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
| `GET` | `/api/pokemon/:id` | Ficha completa (cadena evolutiva, Megaevoluciones, formas Gigamax y variantes/formas) |
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

## Variantes y formas

La ficha individual de cada Pokémon incluye una sección **Variantes y formas** inmediatamente después de la cadena evolutiva. Muestra todas las variedades que PokéAPI asocia a la especie mediante `pokemon-species.varieties` y las clasifica según la taxonomía de [WikiDex](https://www.wikidex.net/wiki/Lista_de_Pok%C3%A9mon_con_diferentes_formas).

### Clasificación

| Categoría | Etiqueta | Ejemplos |
|---|---|---|
| `regional` | Formas regionales | Alola, Galar, Hisui, Paldea |
| `mega` | Megaevoluciones | Delegado a la sección existente |
| `primal` | Formas primigenias | Kyogre y Groudon primigenios |
| `gmax` | Gigamax | Delegado a la sección Dinamax |
| `battle` | Formas de combate | Zacian coronado, Aegislash filo, Palafin héroe |
| `cosmetic` | Variantes estéticas | Minior colores, Squawkabilly plumajes, tamaños |
| `attire` | Atuendos y accesorios | Gorras de Pikachu, cosplay, Zarude papá |
| `gender` | Variantes de género | Indeedee, Meowstic, Basculegion hembra |
| `alt-form` | Formas alternativas | Deoxys, Rotom, Kyurem, Oricorio, Calyrex |
| `totem` | Formas totémicas | Raticate, Marowak, Mimikyu totémicos |
| `special` | Variantes especiales | Pikachu/Eevee de compañero, Ursaluna luna carmesí |
| `non-playable` | Formas no jugables | Eternamax Eternatus, Floette eterna |

Las categorías `mega` y `gmax` se delegan visualmente a las secciones «Megaevoluciones» y «Dinamax/Gigamax» existentes mediante accesos destacados que enlazan a sus anclas, evitando duplicar datos y componentes.

### Arquitectura

La pertenencia de una forma a una especie **no** se decide por nombres: se toma de `pokemon-species.varieties`, que PokéAPI ya entrega al cargar la ficha. Cada variedad incluye `is_default`, nombre y URL (de donde se obtiene el ID numérico).

```
Pokémon 145 (Zapdos, is_default: true)
  ├── 145   zapdos
  └── 10170 zapdos-galar
```

**Backend:** `backend/src/services/variants.ts` contiene:

- **Registro de categorías** (`VARIANT_CATEGORIES`): etiqueta, tono visual, emoji, sección de destino, permanencia y efectos por defecto.
- **Reglas de clasificación** (`CLASSIFICATION_RULES`): expresiones regulares ordenadas de lo más específico a lo general. Una forma desconocida cae en `alt-form`.
- **Metadatos curados** (`VARIANT_METADATA`): descripciones, condiciones, región y nombres en español para cada variante conocida.
- **Constructor puro** `buildVariantFamily()`: recibe las variedades de `getSpeciesInfo()` y los tipos ya conocidos (`typesById`), sin hacer peticiones adicionales.

El módulo `gmaxVariantLabel` se extrajo a `gmaxLabels.ts` para evitar un ciclo de imports entre `pokemon.ts` (que importa `buildVariantFamily`) y `variants.ts` (que necesita la etiqueta de variantes Gigamax).

**Frontend:** `frontend/src/components/VariantsAndForms.tsx`:

- Cabecera colapsable con título, contador total (`N variantes`), descripción contextual y pills compactas con el número real de cada categoría.
- Chips de filtro por categoría (incluida «Todas») con contador y estado activo. La búsqueda por nombre aparece a partir de 6 formas locales y normaliza mayúsculas y acentos.
- Grid responsive de 2/3/4–5 columnas con tarjetas uniformes: artwork protagonista con `object-fit: contain`, nombre sin truncar (hasta dos líneas), badge de categoría, tipos, región, condición o descripción y permanencia. La tarjeta completa abre `/pokemon/:id`.
- Paginación progresiva con «Mostrar más variantes» (`PAGE_SIZE = 10`). Cambiar de filtro o de búsqueda reinicia la página y la barra de estado indica «Mostrando X de Y formas».
- Las variantes `mega` y `gmax` no se duplican: se ofrecen como accesos destacados a `#mega-title` y `#dynamax-title`, mientras sus fichas detalladas siguen en `MegaForms` y `DynamaxForms`.
- Los Pokémon paradoja se presentan en un bloque independiente, separados de las formas locales, con su era (Pasado/Futuro) y enlace a su ficha.
- Estado vacío elegante cuando no hay variantes, cuando la búsqueda no encuentra coincidencias o cuando la familia solo contiene transformaciones delegadas.
- Barra de navegación inversa cuando se está viendo una variante (no la especie base): enlace a `/pokemon/:baseId`.
- `PokemonDetail` solo monta la sección cuando `variantFamily` está presente; el componente además cubre el estado vacío de forma defensiva.

**Sin tabla Prisma:** Los Pokémon no viven en PostgreSQL. El catálogo backend versionado (`variants.ts`) es la fuente de metadatos, siguiendo el patrón de `gmaxMoves.ts`.

### Estructura de datos

**Respuesta de `GET /api/pokemon/:id`:**

```json
{
  "speciesId": 25,
  "variantFamily": {
    "speciesId": 25,
    "speciesName": "pikachu",
    "baseId": 25,
    "baseName": "pikachu",
    "baseDisplayName": "Pikachu",
    "currentId": 10094,
    "isDefault": false,
    "total": 15,
    "variants": [
      {
        "id": 10094,
        "name": "pikachu-original-cap",
        "displayName": "Pikachu con gorra original",
        "category": {
          "key": "attire",
          "label": "Atuendos y accesorios",
          "shortLabel": "Atuendo",
          "emoji": "🎩",
          "tone": "fuchsia",
          "section": "variants"
        },
        "description": "Pikachu con la gorra clásica de la región de Kanto.",
        "condition": "Evento de Pokémon Sol y Luna",
        "permanence": "permanent",
        "affects": "appearance",
        "availability": "event",
        "kind": "record",
        "navigable": true,
        "isCurrent": true,
        "sprite": "https://.../10094.png",
        "artwork": "https://.../10094.png",
        "types": ["electric"]
      }
    ]
  }
}
```

El campo `variantFamily` solo se incluye cuando hay variantes (`total > 0`) o Pokémon paradoja relacionados.

### Cómo añadir categorías o variantes

**Añadir una categoría:** registrar la entrada en `VARIANT_CATEGORIES` (definición, tono, sección, orden). El frontend la pinta automáticamente.

**Añadir metadatos de una variante:** agregar una entrada en `VARIANT_METADATA` con el slug (ej. `"pikachu-world-cap"`), especificando solo los campos que difieren del valor por defecto de la categoría.

**Clasificar una forma nueva:** si no casa con las reglas existentes, añadir una regla en `CLASSIFICATION_RULES` o crear una entrada en `VARIANT_METADATA` con la categoría deseada.

No hace falta tocar el frontend para añadir variantes: si PokéAPI las publica en `varieties`, aparecen automáticamente.

### Rendimiento

- No se consulta `/pokemon/{id}` por cada variante: el arte y sprite se derivan del ID.
- Se reutiliza la caché de especie del detalle (10 minutos en memoria).
- Los tipos de cada variante se obtienen del `typesById` que ya reúne la ficha (tipos base, Megas y Gigamax).
- Las imágenes cargan de forma diferida (`loading="lazy"`).
- Las categorías Mega y Gigamax no duplican datos en la respuesta: el frontend las redirige a las secciones ya existentes.

### Ejemplos reales

| Pokémon | Especie | Variantes | Categorías |
|---|---|---|---|
| Pikachu (#25) | 25 | ~16 (gorras, cosplay, Gigamax, compañero) | `attire`, `gmax`, `special` |
| Zacian (#888) | 888 | 1 (`zacian-crowned`) | `battle` (permanente) |
| Zapdos (#145) | 145 | 1 (`zapdos-galar`) | `regional` |
| Charizard (#6) | 6 | 3 (Mega X, Mega Y, Gigamax) | `mega`, `gmax` |
| Bulbasaur (#1) | 1 | 0 | — |

### Modelo de datos de variantes

Cada variante incluye:

| Campo | Tipo | Descripción |
|---|---|---|
| `kind` | `"record" \| "state"` | `record` para formas con ID propio; `state` reservado para estados sin registro (ej. Ilusión de Zoroark) |
| `navigable` | `boolean` | `true` si la forma tiene ruta `/pokemon/:id` |
| `permanence` | `"permanent" \| "temporary" \| "battle"` | Clasificación de la duración del cambio |
| `affects` | `"appearance" \| "stats" \| "both"` | Qué aspecto altera la variante |
| `availability` | `"playable" \| "event" \| "npc" \| "unavailable"` | Cómo se obtiene |

### Validaciones realizadas

- Pikachu: todas sus variedades, incluidas gorras (como `attire`), cosplay y Gigamax.
- Zacian coronado: clasificado como `battle` con `permanence: "permanent"` y condición «Equipar la Espada Oxidada».
- Zapdos de Galar: clasificado como `regional` con `region: "Galar"`.
- Pokémon con variantes regionales de Alola, Galar, Hisui y Paldea.
- Pokémon con varias categorías (Charizard: Mega + Gigamax).
- Pokémon sin variantes (Bulbasaur): la sección no se renderiza.
- Navegación inversa: desde una variante se puede volver a la especie principal.
- Pikachu-alola-cap clasificado como `attire`, no como `regional`.
- Zacian crowned con `permanence: "permanent"` (permanece mientras lleva el objeto).

## Sistema de animaciones

Toda la app comparte un único lenguaje de movimiento, centrado en `transform` y `opacity` (nunca se animan `width`, `height`, `top` ni `left`) y con respeto total a `prefers-reduced-motion`.

### Fundamentos

- **`frontend/src/lib/motion.ts`:** tokens centralizados — duraciones `fast 0.15 s`, `base 0.2 s`, `slow 0.35 s`; easings `easeOut` (entradas) y `easeIn` (salidas); un spring suave (`stiffness 300`, `damping 28`) para elementos interactivos; variants reutilizables `fadeIn`, `fadeUp`, `scaleIn`, `slideInRight` (drawer), `slideInUp` (bottom sheet) y `staggerContainer` (paso de 60 ms).
- **`MotionProvider`** (`src/context/`): `LazyMotion features={domAnimation} strict` + `MotionConfig reducedMotion="user"` en la raíz. Los componentes usan `m.*` en vez de `motion.*` para reducir el bundle.
- **`LayoutMotionProvider`:** carga `domMax` bajo demanda solo en el subárbol que necesita `layout`/`layoutId` (pestañas), en un chunk aparte.
- **`useReducedMotionSafe()`:** normaliza el hook de Framer Motion a booleano para desactivar por JS los casos que `MotionConfig` no cubre (count-up, Recharts, scroll).

### Dónde se aplica

| Superficie | Movimiento |
|---|---|
| Rutas | `AnimatePresence mode="wait"`, fade + desplazamiento de 10 px, 200 ms; `Suspense` con skeleton por ruta. |
| Pestañas del admin | Píldora con `layoutId`, spring suave; panel con fade + 8 px. |
| Stat cards | Entrada escalonada (60 ms), count-up y hover con `translateY(-2px)`. |
| Listas y grillas | Entrada/salida y reacomodación con `layout`, limitadas a 12 ítems animados por lista. |
| Modal / Drawer | Fade del fondo y entrada deslizada (abajo en móvil, derecha en desktop); salida manteniendo el portal montado. Foco atrapado y devuelto. |
| Formularios | Shake breve en error, mensajes con `role="alert"` y `aria-describedby`. |
| Gráficos | Recharts con `animationDuration: 600` y `isAnimationActive` desactivado con movimiento reducido. |
| Skeletons y vacíos | Shimmer, fade hacia el contenido y Poké Ball con flotación idle muy sutil. |
| Páginas públicas | Fade de artwork al cargar, hero con count-up, barras de stats con `scaleX`. |

### Rendimiento

- Las 8 rutas excepto la portada se cargan con `React.lazy`; Recharts y el panel de administración quedan fuera del bundle inicial.
- El bundle principal pasó de ~736 KB (209 KB gzip) a ~450 KB (145 KB gzip). El chunk de analíticas (~496 KB / 142 KB gzip) solo se descarga al entrar a `/admin`.
- `nginx.conf` habilita gzip (nivel 6) para JS, CSS, JSON y SVG.
- Se evita `will-change` permanente; no se animan más de ~20 elementos a la vez.

### Decisiones descartadas

- **Virtualización (`@tanstack/react-virtual`):** diferida; choca con `layout`/`AnimatePresence` en las listas que se reacomodan.
- **Radix/shadcn y `vaul`:** innecesarios; los diálogos ya tenían focus trap y no hay bottom sheets dedicados.
- **`date-fns`:** `src/features/admin/lib/dates.ts` ya usa `Intl` con zona `America/Santiago` y locale `es-CL`.
- **Arrastre para cerrar el Drawer:** requeriría cargar `domMax` en todo el árbol de portales; no justifica el coste.

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
  src/services/gmaxLabels.ts # etiquetas para variantes G-Max dobles (desacoplado de pokemon.ts)
  src/services/variants.ts   # catálogo de categorías, clasificación y constructor de variantes
  src/middleware/          # auth por token/rol y manejo de errores
  tests/
frontend/
  src/pages/               # Home, detalle, favoritos, login, tipo y admin
  src/components/admin/    # CRUD de entrenadores y regalones
  src/components/          # buscador predictivo, card, cadena evolutiva, megas, dinamax, variantes y filtros
  src/components/forms/    # primitivas compartidas de Megaevoluciones y Gigamax
  src/context/             # AuthContext, MotionProvider y LayoutMotionProvider
  src/hooks/               # count-up, movimiento reducido, previews y restauración de scroll
  src/lib/motion.ts        # tokens y variants del sistema de animaciones
  src/features/admin/      # panel: tabs, tablas, drawers, modales, gráficos y esquemas zod
  src/utils/dynamax.ts     # multiplicador de PS, niveles y restricciones de Dinamax
  src/utils/maxMoves.ts    # Max Moves genéricos y nota de potencia
  src/services/api.ts      # cliente Axios tipado
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
- **Movimiento reducido:** todas las animaciones se desactivan con `prefers-reduced-motion`; las filas `<tr>` de las tablas no usan `layout` porque generarían anidamiento DOM inválido, así que esas listas se reordenan de forma instantánea.
- **Validación de formularios:** los formularios del panel usan esquemas zod compartidos (`frontend/src/features/admin/lib/formSchemas.ts`) que reflejan las mismas reglas que el backend; los mensajes de error son anunciados por lectores de pantalla.
