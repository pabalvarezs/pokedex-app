# Recuperación de contraseña

Flujo de autoservicio para que un entrenador que olvidó su contraseña pueda elegir una nueva, sin que un administrador tenga que inventarle una clave.

## Cómo funciona

1. En `/login` el entrenador pulsa **¿Olvidaste tu contraseña?** y llega a `/recuperar`.
2. Ingresa su `username`. El backend responde siempre el mismo mensaje genérico, exista o no la cuenta (evita enumerar usuarios).
3. Si la cuenta existe:
   - se crea un token aleatorio de 32 bytes y se guarda **solo su hash SHA-256** en `password_resets`;
   - el token vence a los 30 minutos y es de un solo uso;
   - se invalidan los enlaces anteriores del mismo usuario;
   - si el usuario tiene `email` y hay proveedor configurado, se envía el enlace por correo;
   - si no hay email o proveedor, la solicitud queda visible en el panel de admin.
4. El enlace lleva a `/restablecer/:token`, donde el entrenador define su nueva contraseña (mínimo 6 caracteres).
5. Al guardar, el token se marca como usado y la contraseña se actualiza. El mismo enlace no vuelve a funcionar.

### Respaldo sin correo (panel de admin)

En `/admin` → pestaña **Recuperaciones** aparecen las solicitudes vigentes. El admin puede:

- ver quién la pidió y si tiene email;
- pulsar **Generar enlace** para crear uno nuevo (invalida el anterior);
- copiar el enlace y entregárselo al entrenador por el canal que usen.

También desde **Entrenadores** → botón **Enlace** se puede generar uno directamente para cualquier cuenta.

### Modo desarrollo

Fuera de producción (`NODE_ENV !== "production"`) la respuesta de `POST /api/auth/forgot-password` incluye `devResetUrl` para probar el flujo sin correo. En producción ese campo **no** se devuelve.

## Archivos principales

| Archivo | Rol |
|---|---|
| `backend/prisma/schema.prisma` | Campo `User.email` y modelo `PasswordReset` |
| `backend/src/services/passwordReset.ts` | Crear/validar/consumir tokens y listar solicitudes |
| `backend/src/services/email.ts` | Envío del correo vía Resend (API HTTPS, sin dependencias) |
| `backend/src/controllers/auth.ts` | `forgot-password`, `reset-password` y límite de solicitudes |
| `backend/src/controllers/admin.ts` | Listar solicitudes y generar enlaces |
| `frontend/src/pages/ForgotPassword.tsx` | Formulario para pedir el enlace |
| `frontend/src/pages/ResetPassword.tsx` | Formulario de nueva contraseña |
| `frontend/src/components/admin/PasswordResetsAdmin.tsx` | Panel de solicitudes |

## API

```http
POST /api/auth/forgot-password
Content-Type: application/json

{ "username": "ash" }
```

```http
POST /api/auth/reset-password
Content-Type: application/json

{ "token": "<token del enlace>", "password": "nuevaClave123" }
```

```http
GET  /api/admin/password-resets          # requiere Bearer token de admin
POST /api/admin/users/:id/password-reset # requiere Bearer token de admin
```

## Aplicar en producción

### 1. Respalda la base de datos

```bash
docker compose exec postgres pg_dump -U pokedex pokedex > backup-$(date +%Y%m%d).sql
```

### 2. Define las variables de entorno

En el `.env` que usa Docker Compose (o en el panel de tu proveedor):

```env
AUTH_SECRET=<secreto largo y aleatorio, distinto al de desarrollo>
CORS_ORIGIN=https://tudominio.cl
APP_URL=https://tudominio.cl

PASSWORD_RESET_TTL_MINUTES=30

RESEND_API_KEY=re_xxxxxxxxxxxxxxxxx
EMAIL_FROM=PokeChile <no-reply@tudominio.cl>
```

- `APP_URL` es la URL pública del **frontend**; con ella se arma el enlace.
- `AUTH_SECRET` no necesita cambiar para esta función, pero debe ser único y privado. Si lo rotas, se invalidan las sesiones activas (tokens de 7 días).
- Si dejas `RESEND_API_KEY`/`EMAIL_FROM` vacíos, el flujo sigue funcionando con el respaldo del panel de admin.

### 3. Aplica el esquema

La imagen del backend ya ejecuta `npx prisma db push` al arrancar (ver `backend/Dockerfile`), así que un despliegue normal crea la tabla `password_resets` y la columna `users.email`.

Si prefieres aplicarlo a mano antes de reiniciar:

```bash
cd backend
npx prisma generate
npx prisma db push
```

Ambos cambios son compatibles hacia atrás: `email` es nullable y la tabla es nueva.

> **Unicidad del email:** se valida en la aplicación al crear o editar entrenadores. El esquema no declara un índice único para que `prisma db push` no se detenga con el aviso de pérdida de datos en despliegues automáticos.

Si un `db push` anterior dejó el contenedor en crash-loop por el aviso de la columna `email`, puedes aplicar ese cambio puntual de forma segura (la columna es nueva y todos sus valores son `NULL`):

```bash
docker compose run --rm backend npx prisma db push --accept-data-loss
docker compose up -d
```

Después actualiza al esquema actual, que ya no requiere ese flag.

### 4. Configura el correo (opcional pero recomendado)

Con [Resend](https://resend.com):

1. Crea una cuenta y una API key.
2. Agrega tu dominio y verifica los registros DNS que te indique (SPF/DKIM).
3. Usa un remitente de ese dominio en `EMAIL_FROM` (por ejemplo `PokeChile <no-reply@tudominio.cl>`).
4. Prueba con una cuenta real: solicita el enlace y revisa bandeja de entrada y spam.

> Para otro proveedor (Brevo, Mailgun, SMTP propio) solo hay que adaptar `backend/src/services/email.ts`. No se agregaron dependencias nuevas: el envío usa `fetch` de Node 20.

### 5. Reconstruye y reinicia

```bash
docker compose build backend frontend
docker compose up -d
```

Si el frontend se sirve aparte, recuerda reconstruirlo con `VITE_API_URL` apuntando a la API pública.

### 6. Carga los emails de los entrenadores

Entra a `/admin` → **Entrenadores** → **Editar** y completa el email. Sin email, la recuperación se resuelve con el enlace manual del admin.

### 7. Verifica el flujo completo

1. Cierra sesión.
2. En `/login` pulsa **¿Olvidaste tu contraseña?** e ingresa un usuario real.
3. Revisa el correo (o la pestaña **Recuperaciones** del admin).
4. Abre el enlace, cambia la contraseña y entra con la nueva.
5. Vuelve a abrir el mismo enlace: debe rechazarlo por usado.

## Seguridad

- **Tokens hasheados:** la base guarda `sha256(token)`. Un dump filtrado no permite entrar.
- **Un solo uso y vigencia:** 30 minutos por defecto, configurable con `PASSWORD_RESET_TTL_MINUTES`; el consumo es transaccional para evitar carreras.
- **Invalidación:** pedir un enlace nuevo invalida el anterior del mismo usuario.
- **Anti-enumeración:** `forgot-password` responde igual para usuarios existentes e inexistentes.
- **Límite de solicitudes:** 5 por IP+usuario cada 15 minutos, en memoria del proceso. Si despliegas varias instancias, cámbialo por Redis o por el rate limit de tu proxy.
- **HTTPS obligatorio:** el token viaja en la URL; nunca publiques el sitio sin TLS.
- **Sesiones existentes:** los tokens de sesión son stateless y duran 7 días, así que cambiar la contraseña no cierra sesiones abiertas en otros dispositivos. Si sospechas que la cuenta estuvo comprometida, rota `AUTH_SECRET` para invalidar todas las sesiones.
- **No registres enlaces en producción:** el backend solo imprime el enlace en consola cuando `NODE_ENV !== "production"`.
- **Logs de acceso:** el token viaja en la ruta `/restablecer/...`. Si tu proxy (nginx, CDN) registra URLs, excluye esa ruta del access log: el enlace queda visible en los logs hasta que se use o venza.
- **Correo:** configura SPF/DKIM para que los enlaces no caigan en spam.
- **Monitoreo:** revisa los errores `[email]` en los logs; no afectan al flujo, pero indican que el enlace quedó solo en el panel de admin.

## Rollback

Si necesitas revertir la función:

```sql
DROP TABLE IF EXISTS password_resets;
ALTER TABLE users DROP COLUMN IF EXISTS email;
```

Luego despliega la versión anterior del código. Los usuarios y contraseñas existentes no se ven afectados.
