# Rediseño Home · Prioridad 2 (Experiencia de usuario)

Mejoras de interacción sobre la portada, reutilizando los servicios y la lógica de
filtros existentes. Sin cambios en la API, en las estructuras de datos ni en las
reglas de negocio.

## Archivos modificados

| Archivo | Cambio |
|---|---|
| `frontend/src/pages/Home.tsx` | Buscador, filtros, estados de carga/error/vacío, Cargar más, accesibilidad |
| `frontend/src/components/PokemonSearch.tsx` | Estado de búsqueda activa, skeletons, error con reintento, teclado |
| `frontend/src/components/PokemonCard.tsx` | Hover/focus, acción de ficha, feedback al guardar, estados |
| `frontend/src/components/PokemonCardSkeleton.tsx` | Nuevo: marcador de carga de tarjetas |
| `frontend/src/index.css` | Animación `skeleton` (respeta `prefers-reduced-motion`) |
| `frontend/tests/App.test.tsx` | 3 pruebas nuevas de regresión de UI |

## Resumen de mejoras

### 1. Buscador
- Indicador **Búsqueda activa** con el término y el número de resultados cuando el
  panel está cerrado; botón _Limpiar_ junto al estado.
- Cabecera del panel con el término y el conteo de resultados.
- **Escape** cierra el panel; un segundo Escape limpia la búsqueda.
- Limpieza rápida con botón de 44 px junto al campo.
- Skeletons durante la consulta en vez de un único texto de carga.
- Estado de error con **Reintentar**; estado sin coincidencias con _Limpiar búsqueda_.
- Ayuda de teclado y ejemplo de búsqueda visibles bajo el campo.
- `aria-activedescendant` corregido, opciones fuera del orden de tabulación y
  desplazamiento de la opción activa dentro de la lista.

### 2. Filtros
- Botones Tipo/Generación con `aria-expanded` y chevron de estado.
- Chips de filtros activos con contador, etiquetas de acción (`Quitar el filtro…`,
  `Volver a incluir…`) y botón _Limpiar filtros_ al final de la fila.
- Identificación visual de tipo (color por tipo) y generación (rojo PokeChile).
- Texto de ayuda: tipos y generaciones se combinan; el orden aplica al resultado.
- Al combinar filtros ya no se muestran resultados sin filtrar mientras cargan.

### 3. Tarjetas
- Aviso _Ver ficha_ al hacer hover/focus y flecha junto al nombre: la tarjeta se lee
  como navegación.
- La acción de regalo es un botón separado (sin `preventDefault` sobre la tarjeta),
  con `aria-pressed`, `aria-busy` y etiquetas que incluyen el nombre del Pokémon.
- Feedback tras guardar: _Guardando…_ con spinner, mensaje de éxito que se
  desvanece y mensaje de error si falla. Se evitan dobles envíos.
- `focus-within` resalta la tarjeta cuando navega el teclado.
- Imagen no disponible con texto de mayor contraste.

### 4. Estados de interfaz
- **Carga inicial**: mensaje + cuadrícula de skeletons con el alto final.
- **Cargar más**: el botón muestra spinner, cuenta restante y queda deshabilitado.
- **Búsqueda sin resultados**: mensaje y _Limpiar búsqueda_.
- **Filtros sin coincidencias**: estado con _Ver todos los Pokémon_.
- **Error**: bloque con _Reintentar_ (y _Limpiar filtros_ si aplica). Si falla al
  cargar más, se conserva el catálogo y el error aparece junto al botón.
- **Imágenes no disponibles**: fallback artwork → sprite → ilustración genérica.

### 5. Navegación y accesibilidad
- Enlace _Saltar al catálogo_ visible al enfocar.
- Foco visible (`focus-visible`) en botones, chips, tarjetas y enlaces.
- Objetivos táctiles de 40–48 px en móvil.
- `role="status"`/`aria-live` para el conteo de resultados y el feedback de tarjetas.
- `motion-reduce` desactiva animaciones de hover y skeleton.

### 6. Carga y exploración
- Guarda anti doble clic en _Cargar más_ además de `disabled`.
- `keepPreviousData` conserva la lista y la posición de desplazamiento.
- Skeletons y `scroll-mt` evitan saltos visuales.

## Capturas

En `docs/rediseno-home/`:

- `ux-desktop.png` — portada en escritorio.
- `ux-mobile.png` — portada en móvil.
- `ux-busqueda.png` — sugerencias predictivas.
- `ux-busqueda-sin-resultados.png` — búsqueda sin coincidencias.
- `ux-filtros.png` — filtros combinados y chips activos.
- `ux-mobile-filtros.png` — filtros en móvil.
- `ux-filtros-sin-resultados.png` — filtros sin coincidencias.
- `ux-cargando-inicial.png` — carga inicial con skeletons.
- `ux-error.png` — error de carga con reintento.
- `ux-sin-imagen.png` — imágenes no disponibles.

## Validación

| Criterio | Resultado |
|---|---|
| `npm test` | 17 pruebas, 3 archivos, todas pasan |
| `npm run build` | `tsc` + `vite build` sin errores |
| Búsqueda | Verificada en navegador (sugerencias, sin resultados, limpieza, Escape) |
| Filtros | Verificados tipo + generación, chips, limpieza y sin coincidencias |
| Teclado | Escape/flechas/Enter en el buscador; foco visible en controles |
| Regresiones | Las 9 pruebas previas de Home/filtros siguen pasando |

No se modificaron `services/api.ts`, el backend ni las estructuras de datos.
