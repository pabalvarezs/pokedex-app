/**
 * PokeAPI no modela Dinamax y usa potencias de relleno para los Max Moves.
 * Estos datos genéricos viven en el frontend porque alimentan el selector
 * visual; los G-Max Moves por forma llegan desde la API.
 */

export interface MaxMove {
  slug: string;
  name: string;
  type: string;
  effect: string;
  /** Maxibarrera reemplaza a los movimientos de estado, no a un tipo. */
  isStatus?: boolean;
}

export const MAX_MOVES: MaxMove[] = [
  {
    slug: "max-strike",
    name: "Maxiataque",
    type: "normal",
    effect: "Baja 1 nivel la Velocidad de todos los rivales.",
  },
  {
    slug: "max-knuckle",
    name: "Maxipuño",
    type: "fighting",
    effect: "Sube 1 nivel el Ataque del usuario y sus aliados.",
  },
  {
    slug: "max-airstream",
    name: "Maxiciclón",
    type: "flying",
    effect: "Sube 1 nivel la Velocidad del usuario y sus aliados.",
  },
  {
    slug: "max-ooze",
    name: "Maxiácido",
    type: "poison",
    effect: "Sube 1 nivel el Ataque Especial del usuario y sus aliados.",
  },
  {
    slug: "max-quake",
    name: "Maxitemblor",
    type: "ground",
    effect: "Sube 1 nivel la Defensa Especial del usuario y sus aliados.",
  },
  {
    slug: "max-rockfall",
    name: "Maxilito",
    type: "rock",
    effect: "Invoca una tormenta de arena durante 5 turnos.",
  },
  {
    slug: "max-flutterby",
    name: "Maxinsecto",
    type: "bug",
    effect: "Baja 1 nivel el Ataque Especial de todos los rivales.",
  },
  {
    slug: "max-phantasm",
    name: "Maxiespectro",
    type: "ghost",
    effect: "Baja 1 nivel la Defensa de todos los rivales.",
  },
  {
    slug: "max-steelspike",
    name: "Maximetal",
    type: "steel",
    effect: "Sube 1 nivel la Defensa del usuario y sus aliados.",
  },
  {
    slug: "max-flare",
    name: "Maxignición",
    type: "fire",
    effect: "Invoca sol intenso durante 5 turnos.",
  },
  {
    slug: "max-geyser",
    name: "Maxichorro",
    type: "water",
    effect: "Invoca lluvia durante 5 turnos.",
  },
  {
    slug: "max-overgrowth",
    name: "Maxiflora",
    type: "grass",
    effect: "Activa el campo de hierba durante 5 turnos.",
  },
  {
    slug: "max-lightning",
    name: "Maxitormenta",
    type: "electric",
    effect: "Activa el campo eléctrico durante 5 turnos.",
  },
  {
    slug: "max-mindstorm",
    name: "Maxionda",
    type: "psychic",
    effect: "Activa el campo psíquico durante 5 turnos.",
  },
  {
    slug: "max-hailstorm",
    name: "Maxihelada",
    type: "ice",
    effect: "Invoca granizo durante 5 turnos.",
  },
  {
    slug: "max-wyrmwind",
    name: "Maxidraco",
    type: "dragon",
    effect: "Baja 1 nivel el Ataque de todos los rivales.",
  },
  {
    slug: "max-darkness",
    name: "Maxisombra",
    type: "dark",
    effect: "Baja 1 nivel la Defensa Especial de todos los rivales.",
  },
  {
    slug: "max-starfall",
    name: "Maxiestela",
    type: "fairy",
    effect: "Activa la niebla misteriosa durante 5 turnos.",
  },
  {
    slug: "max-guard",
    name: "Maxibarrera",
    type: "normal",
    effect: "Protege al usuario de todos los movimientos durante ese turno.",
    isStatus: true,
  },
];

/** Max Move que corresponde a cada tipo (Maxibarrera queda fuera). */
export const MAX_MOVE_BY_TYPE: Record<string, MaxMove> = Object.fromEntries(
  MAX_MOVES.filter((move) => !move.isStatus).map((move) => [move.type, move])
);

export const MAX_GUARD =
  MAX_MOVES.find((move) => move.slug === "max-guard") ?? MAX_MOVES[0];

export const GMAX_POWER_NOTE =
  "La potencia depende del movimiento original (90–150). Rillaboom, Cinderace e Inteleon siempre usan 160.";
