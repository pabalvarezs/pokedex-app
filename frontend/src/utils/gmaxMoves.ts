/**
 * PokeAPI no incluye los movimientos Gigamax (0 de 937 movimientos) y la
 * potencia de los Max Moves viene como placeholder. Estos mapas curados usan
 * los nombres en español de WikiDex y los tipos de Bulbapedia.
 */

export interface MaxMove {
  slug: string;
  name: string;
  type: string;
  effect: string;
  /** Maxibarrera reemplaza a los movimientos de estado, no a un tipo. */
  isStatus?: boolean;
}

export interface GmaxMove {
  /** Nombre exacto de la forma en PokeAPI, por ejemplo "charizard-gmax". */
  formSlug: string;
  species: string;
  name: string;
  type: string;
  effect: string;
  /** Rillaboom, Cinderace e Inteleon siempre tienen 160 de potencia. */
  fixedPower?: boolean;
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

export const GMAX_MOVES: GmaxMove[] = [
  {
    formSlug: "venusaur-gmax",
    species: "Venusaur",
    name: "Gigalianas",
    type: "grass",
    effect:
      "Inflige daño durante 4 turnos a los rivales que no sean de tipo Planta.",
  },
  {
    formSlug: "charizard-gmax",
    species: "Charizard",
    name: "Gigallamarada",
    type: "fire",
    effect:
      "Inflige daño durante 4 turnos a los rivales que no sean de tipo Fuego.",
  },
  {
    formSlug: "blastoise-gmax",
    species: "Blastoise",
    name: "Gigacañonazo",
    type: "water",
    effect:
      "Inflige daño durante 4 turnos a los rivales que no sean de tipo Agua.",
  },
  {
    formSlug: "butterfree-gmax",
    species: "Butterfree",
    name: "Gigaestupor",
    type: "bug",
    effect: "Envenena, duerme o paraliza a todos los rivales.",
  },
  {
    formSlug: "pikachu-gmax",
    species: "Pikachu",
    name: "Gigatronada",
    type: "electric",
    effect: "Paraliza a todos los rivales.",
  },
  {
    formSlug: "meowth-gmax",
    species: "Meowth",
    name: "Gigamonedas",
    type: "normal",
    effect: "Esparce monedas y confunde a todos los rivales.",
  },
  {
    formSlug: "machamp-gmax",
    species: "Machamp",
    name: "Gigapuñición",
    type: "fighting",
    effect:
      "Sube 1 nivel la probabilidad de golpe crítico del usuario y sus aliados.",
  },
  {
    formSlug: "gengar-gmax",
    species: "Gengar",
    name: "Gigaaparición",
    type: "ghost",
    effect: "Impide que los rivales sean reemplazados.",
  },
  {
    formSlug: "kingler-gmax",
    species: "Kingler",
    name: "Gigaespuma",
    type: "water",
    effect: "Baja 2 niveles la Velocidad de todos los rivales.",
  },
  {
    formSlug: "lapras-gmax",
    species: "Lapras",
    name: "Gigamelodía",
    type: "ice",
    effect:
      "Reduce el daño físico y especial durante 5 turnos (Velo Aurora).",
  },
  {
    formSlug: "eevee-gmax",
    species: "Eevee",
    name: "Gigaternura",
    type: "normal",
    effect: "Enamora a todos los rivales del sexo opuesto.",
  },
  {
    formSlug: "snorlax-gmax",
    species: "Snorlax",
    name: "Gigarreciclaje",
    type: "normal",
    effect: "50 % de probabilidad de restaurar las bayas consumidas.",
  },
  {
    formSlug: "garbodor-gmax",
    species: "Garbodor",
    name: "Gigapestilencia",
    type: "poison",
    effect: "Envenena a todos los rivales.",
  },
  {
    formSlug: "melmetal-gmax",
    species: "Melmetal",
    name: "Gigafundido",
    type: "steel",
    effect:
      "Impide que los rivales usen el mismo movimiento dos veces seguidas.",
  },
  {
    formSlug: "rillaboom-gmax",
    species: "Rillaboom",
    name: "Gigarredoble",
    type: "grass",
    effect: "Ignora las habilidades del objetivo. Potencia fija de 160.",
    fixedPower: true,
  },
  {
    formSlug: "cinderace-gmax",
    species: "Cinderace",
    name: "Gigaesfera Ígnea",
    type: "fire",
    effect: "Ignora las habilidades del objetivo. Potencia fija de 160.",
    fixedPower: true,
  },
  {
    formSlug: "inteleon-gmax",
    species: "Inteleon",
    name: "Gigadisparo",
    type: "water",
    effect: "Ignora las habilidades del objetivo. Potencia fija de 160.",
    fixedPower: true,
  },
  {
    formSlug: "corviknight-gmax",
    species: "Corviknight",
    name: "Gigahuracán",
    type: "flying",
    effect: "Elimina pantallas, trampas y campos del lado rival.",
  },
  {
    formSlug: "orbeetle-gmax",
    species: "Orbeetle",
    name: "Gigabóveda",
    type: "psychic",
    effect: "Intensifica la gravedad durante 5 turnos.",
  },
  {
    formSlug: "drednaw-gmax",
    species: "Drednaw",
    name: "Gigatrampa Rocas",
    type: "water",
    effect: "Coloca Trampa Rocas en el campo rival.",
  },
  {
    formSlug: "coalossal-gmax",
    species: "Coalossal",
    name: "Gigarroca Ígnea",
    type: "rock",
    effect:
      "Inflige daño durante 4 turnos a los rivales que no sean de tipo Roca.",
  },
  {
    formSlug: "flapple-gmax",
    species: "Flapple",
    name: "Gigacorrosión",
    type: "grass",
    effect: "Baja 1 nivel la Evasión de todos los rivales.",
  },
  {
    formSlug: "appletun-gmax",
    species: "Appletun",
    name: "Giganéctar",
    type: "grass",
    effect: "Cura los problemas de estado del equipo.",
  },
  {
    formSlug: "sandaconda-gmax",
    species: "Sandaconda",
    name: "Gigapolvareda",
    type: "ground",
    effect:
      "Atrapa al objetivo en una trampa de arena durante 4 o 5 turnos.",
  },
  {
    formSlug: "toxtricity-amped-gmax",
    species: "Toxtricity (Aguda)",
    name: "Gigadescarga",
    type: "electric",
    effect: "Envenena o paraliza a todos los rivales.",
  },
  {
    formSlug: "toxtricity-low-key-gmax",
    species: "Toxtricity (Grave)",
    name: "Gigadescarga",
    type: "electric",
    effect: "Envenena o paraliza a todos los rivales.",
  },
  {
    formSlug: "centiskorch-gmax",
    species: "Centiskorch",
    name: "Gigacienfuegos",
    type: "fire",
    effect: "Atrapa al objetivo en un giro fuego durante 4 o 5 turnos.",
  },
  {
    formSlug: "hatterene-gmax",
    species: "Hatterene",
    name: "Gigacastigo",
    type: "fairy",
    effect: "Confunde a todos los rivales.",
  },
  {
    formSlug: "grimmsnarl-gmax",
    species: "Grimmsnarl",
    name: "Gigasopor",
    type: "dark",
    effect:
      "50 % de probabilidad de que el objetivo se duerma al final del siguiente turno.",
  },
  {
    formSlug: "alcremie-gmax",
    species: "Alcremie",
    name: "Gigacolofón",
    type: "fairy",
    effect: "Cura 1/6 de los PS máximos al usuario y sus aliados.",
  },
  {
    formSlug: "copperajah-gmax",
    species: "Copperajah",
    name: "Gigatrampa Acero",
    type: "steel",
    effect: "Esparce púas de acero en el campo rival.",
  },
  {
    formSlug: "duraludon-gmax",
    species: "Duraludon",
    name: "Gigadesgaste",
    type: "dragon",
    effect: "Resta 2 PP al último movimiento usado por el rival.",
  },
  {
    formSlug: "urshifu-single-strike-gmax",
    species: "Urshifu (Brusca)",
    name: "Gigagolpe Brusco",
    type: "dark",
    effect: "Golpea incluso si el objetivo se protege.",
  },
  {
    formSlug: "urshifu-rapid-strike-gmax",
    species: "Urshifu (Fluida)",
    name: "Gigagolpe Fluido",
    type: "water",
    effect: "Golpea incluso si el objetivo se protege.",
  },
];

const GMAX_MOVE_BY_FORM = new Map(
  GMAX_MOVES.map((move) => [move.formSlug, move])
);

export function gmaxMoveFor(formName: string): GmaxMove | undefined {
  return GMAX_MOVE_BY_FORM.get(formName.trim().toLowerCase());
}

export const GMAX_POWER_NOTE =
  "La potencia depende del movimiento original (90–150). Rillaboom, Cinderace e Inteleon siempre usan 160.";
