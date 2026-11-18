# Auditoría y diseño: variantes y formas Pokémon

## 1. Alcance

Esta nota documenta la investigación previa a la sección **Variantes y formas** de la ficha individual. La referencia de clasificación es la página de WikiDex [Lista de Pokémon con diferentes formas](https://www.wikidex.net/wiki/Lista_de_Pok%C3%A9mon_con_diferentes_formas).

## 2. Estado del proyecto antes de la implementación

- **Pokémon:** no viven en PostgreSQL. El backend actúa como proxy y caché de PokéAPI. Prisma solo modela usuarios, recuperaciones de contraseña y regalones.
- **Relación especie → formas:** PokéAPI la entrega en `GET /pokemon-species/{id}`, campo `varieties`. Cada entrada incluye `is_default`, el nombre del Pokémon y su URL (de donde sale el ID real).
- **Ficha individual:** `GET /api/pokemon/:id` devuelve tipos, estadísticas, habilidades, movimientos, descripción, cadena evolutiva, Megaevoluciones y formas Gigamax.
- **Frontend:** la ficha usa React Router (`/pokemon/:id`). La cadena evolutiva está dentro de la tarjeta principal; Megaevoluciones y Dinamax/Gigamax son secciones posteriores. Las imágenes usan `PokemonArtwork`, que ya aplica carga diferida y respaldo arte → sprite → Poké Ball.
- **Caché:** las respuestas de PokéAPI se guardan 10 minutos por proceso; las peticiones simultáneas del mismo Pokémon se deduplican.

### Comprobación de los ejemplos solicitados

| Pokémon | Especie | Variedades reales en PokéAPI |
|---|---|---|
| Pikachu | 25 | 10080–10085 (cosplay, rock star, belle, pop star, Ph.D. y libre), 10094–10099 (gorras), 10148 (gorra de compañero), 10158 (compañero), 10160 (gorra del Mundial) y 10199 (Gigamax) |
| Zacian | 888 | 10188 (`zacian-crowned`) |
| Zapdos | 145 | 10170 (`zapdos-galar`) |

Los IDs coinciden con los ejemplos del enunciado, pero Pikachu tiene más formas que las siete indicadas. La implementación las incorpora todas porque nacen de `varieties`, no de una lista escrita a mano.

## 3. Taxonomía observada en WikiDex

WikiDex separa las formas en cinco bloques. La implementación mantiene esa base y añade categorías operativas para que la interfaz pueda etiquetar y ordenar sin ramas específicas por Pokémon.

| Bloque WikiDex | Categorías internas |
|---|---|
| Cambian de forma en combate | `battle` (combate), `mega`, `primal`, `gmax` |
| Cambian de forma fuera de combate | `alt-form`, `cosmetic`, `attire` |
| Forma distinta permanente | `regional`, `gender`, `cosmetic`, `alt-form`, `totem` |
| Forma distinta no jugable | `non-playable` |
| Formas no distinguibles | Sin registro propio en PokéAPI; se reserva `kind: "state"` |
| Casos singulares | `special` |

Categorías previstas:

1. **Formas regionales:** Alola, Galar, Hisui y Paldea.
2. **Megaevoluciones:** Mega, Mega X/Y/Z.
3. **Formas primigenias:** Kyogre y Groudon primigenios.
4. **Gigamax:** formas con Factor Gigamax.
5. **Formas de combate:** estados reversibles activados por habilidad, movimiento o PS.
6. **Variantes estéticas:** color, plumaje, patrón o tamaño sin cambio sustancial.
7. **Atuendos y accesorios:** gorras, cosplay y disfraces.
8. **Variantes de género:** hembra/macho con apariencia diferenciada.
9. **Formas alternativas permanentes:** Deoxys, Rotom, Kyurem, Oricorio, Calyrex, etc.
10. **Formas totémicas:** versiones de mayor tamaño usadas por jefes.
11. **Variantes especiales:** Ultra-Necrozma, Ash-Greninja, Bloodmoon Ursaluna, etc.
12. **Formas no jugables:** Eternamax y otras apariciones exclusivas de la historia.

## 4. Decisión de arquitectura

### Fuente de la relación

La relación **no** se deriva de nombres ni de coincidencias de texto. Se toma de `pokemon-species.varieties`:

```text
Pokémon 145 (Zapdos, is_default: true)
  ├── 145   zapdos
  └── 10170 zapdos-galar
```

Cada variedad tiene un ID real y una URL de PokéAPI. El Pokémon por defecto (`is_default`) representa a la especie principal y permite la navegación inversa.

### Catálogo backend

`backend/src/services/variants.ts` contiene:

- el registro de categorías (etiqueta, tono visual, sección de destino, permanencia y efecto por defecto);
- reglas de clasificación por sufijo (`-alola`, `-mega`, `-gmax`, `-totem`, etc.);
- metadatos curados por slug para descripciones, condiciones, región, permanencia y nombres en español;
- un constructor puro de la familia de variantes.

La categoría es metadato; la pertenencia sigue viniendo de PokéAPI. Una forma desconocida cae en `alt-form`, por lo que nunca desaparece de la ficha aunque se añada una especie nueva.

### Sin tabla Prisma

No se crea una tabla de variantes porque:

- los Pokémon no están en la base de datos;
- una tabla solo con IDs y metadatos crearía dos fuentes de verdad;
- el proyecto ya usa catálogos backend versionados para datos curados que PokéAPI no modela (por ejemplo, `gmaxMoves.ts`);
- el catálogo se puede ampliar sin tocar componentes ni volver a sembrar la base.

### Rendimiento

- No se consulta `/pokemon/{id}` por cada variante: el arte y el sprite se construyen con el ID que ya entrega `varieties`.
- Se reutiliza la caché de especie del detalle.
- La respuesta de una variante reutiliza la misma caché de especie para resolver la familia completa.
- Las imágenes se cargan de forma diferida en el frontend.
- Mega y Gigamax se derivan a sus secciones existentes para no duplicar datos ni componentes.

## 5. Contrato de la API

`GET /api/pokemon/:id` incorpora `variantFamily`:

```json
{
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
        "tone": "fuchsia",
        "section": "variants"
      },
      "region": null,
      "condition": "Evento de Pokémon Sol y Luna",
      "permanence": "permanent",
      "affects": "appearance",
      "kind": "record",
      "navigable": true,
      "isCurrent": true
    }
  ]
}
```

## 6. Criterios de validación

- Pikachu: todas sus variedades, incluidas gorras, cosplay y Gigamax.
- Zacian: forma coronada con navegación inversa a la especie 888.
- Zapdos: forma de Galar como variante regional.
- Pokémon con variantes regionales de las cuatro regiones.
- Pokémon con varias categorías (por ejemplo, Charizard: Mega y Gigamax).
- Pokémon sin variantes: `PokemonDetail` no monta la sección; el componente muestra además un estado vacío defensivo.
- Formas temporales: se marcan como `temporary` o `battle` y muestran su condición.
