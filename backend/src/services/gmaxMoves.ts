/**
 * PokeAPI no incluye los movimientos Gigamax: solo existen como datos curados.
 * El backend los adjunta a cada forma para que el cliente no mantenga el
 * catálogo y el contrato de la API sea la única fuente.
 */

export interface GmaxMove {
  name: string;
  type: string;
  effect: string;
  /** Rillaboom, Cinderace e Inteleon siempre tienen 160 de potencia. */
  fixedPower?: boolean;
}

interface GmaxMoveRecord extends GmaxMove {
  /** Nombre exacto de la forma en PokeAPI, por ejemplo "charizard-gmax". */
  formSlug: string;
}

export const GMAX_MOVES: GmaxMoveRecord[] = [
  {
    formSlug: "venusaur-gmax",
    name: "Gigalianas",
    type: "grass",
    effect:
      "Inflige daño durante 4 turnos a los rivales que no sean de tipo Planta.",
  },
  {
    formSlug: "charizard-gmax",
    name: "Gigallamarada",
    type: "fire",
    effect:
      "Inflige daño durante 4 turnos a los rivales que no sean de tipo Fuego.",
  },
  {
    formSlug: "blastoise-gmax",
    name: "Gigacañonazo",
    type: "water",
    effect:
      "Inflige daño durante 4 turnos a los rivales que no sean de tipo Agua.",
  },
  {
    formSlug: "butterfree-gmax",
    name: "Gigaestupor",
    type: "bug",
    effect: "Envenena, duerme o paraliza a todos los rivales.",
  },
  {
    formSlug: "pikachu-gmax",
    name: "Gigatronada",
    type: "electric",
    effect: "Paraliza a todos los rivales.",
  },
  {
    formSlug: "meowth-gmax",
    name: "Gigamonedas",
    type: "normal",
    effect: "Esparce monedas y confunde a todos los rivales.",
  },
  {
    formSlug: "machamp-gmax",
    name: "Gigapuñición",
    type: "fighting",
    effect:
      "Sube 1 nivel la probabilidad de golpe crítico del usuario y sus aliados.",
  },
  {
    formSlug: "gengar-gmax",
    name: "Gigaaparición",
    type: "ghost",
    effect: "Impide que los rivales sean reemplazados.",
  },
  {
    formSlug: "kingler-gmax",
    name: "Gigaespuma",
    type: "water",
    effect: "Baja 2 niveles la Velocidad de todos los rivales.",
  },
  {
    formSlug: "lapras-gmax",
    name: "Gigamelodía",
    type: "ice",
    effect:
      "Reduce el daño físico y especial durante 5 turnos (Velo Aurora).",
  },
  {
    formSlug: "eevee-gmax",
    name: "Gigaternura",
    type: "normal",
    effect: "Enamora a todos los rivales del sexo opuesto.",
  },
  {
    formSlug: "snorlax-gmax",
    name: "Gigarreciclaje",
    type: "normal",
    effect: "50 % de probabilidad de restaurar las bayas consumidas.",
  },
  {
    formSlug: "garbodor-gmax",
    name: "Gigapestilencia",
    type: "poison",
    effect: "Envenena a todos los rivales.",
  },
  {
    formSlug: "melmetal-gmax",
    name: "Gigafundido",
    type: "steel",
    effect:
      "Impide que los rivales usen el mismo movimiento dos veces seguidas.",
  },
  {
    formSlug: "rillaboom-gmax",
    name: "Gigarredoble",
    type: "grass",
    effect: "Ignora las habilidades del objetivo. Potencia fija de 160.",
    fixedPower: true,
  },
  {
    formSlug: "cinderace-gmax",
    name: "Gigaesfera Ígnea",
    type: "fire",
    effect: "Ignora las habilidades del objetivo. Potencia fija de 160.",
    fixedPower: true,
  },
  {
    formSlug: "inteleon-gmax",
    name: "Gigadisparo",
    type: "water",
    effect: "Ignora las habilidades del objetivo. Potencia fija de 160.",
    fixedPower: true,
  },
  {
    formSlug: "corviknight-gmax",
    name: "Gigahuracán",
    type: "flying",
    effect: "Elimina pantallas, trampas y campos del lado rival.",
  },
  {
    formSlug: "orbeetle-gmax",
    name: "Gigabóveda",
    type: "psychic",
    effect: "Intensifica la gravedad durante 5 turnos.",
  },
  {
    formSlug: "drednaw-gmax",
    name: "Gigatrampa Rocas",
    type: "water",
    effect: "Coloca Trampa Rocas en el campo rival.",
  },
  {
    formSlug: "coalossal-gmax",
    name: "Gigarroca Ígnea",
    type: "rock",
    effect:
      "Inflige daño durante 4 turnos a los rivales que no sean de tipo Roca.",
  },
  {
    formSlug: "flapple-gmax",
    name: "Gigacorrosión",
    type: "grass",
    effect: "Baja 1 nivel la Evasión de todos los rivales.",
  },
  {
    formSlug: "appletun-gmax",
    name: "Giganéctar",
    type: "grass",
    effect: "Cura los problemas de estado del equipo.",
  },
  {
    formSlug: "sandaconda-gmax",
    name: "Gigapolvareda",
    type: "ground",
    effect:
      "Atrapa al objetivo en una trampa de arena durante 4 o 5 turnos.",
  },
  {
    formSlug: "toxtricity-amped-gmax",
    name: "Gigadescarga",
    type: "electric",
    effect: "Envenena o paraliza a todos los rivales.",
  },
  {
    formSlug: "toxtricity-low-key-gmax",
    name: "Gigadescarga",
    type: "electric",
    effect: "Envenena o paraliza a todos los rivales.",
  },
  {
    formSlug: "centiskorch-gmax",
    name: "Gigacienfuegos",
    type: "fire",
    effect: "Atrapa al objetivo en un giro fuego durante 4 o 5 turnos.",
  },
  {
    formSlug: "hatterene-gmax",
    name: "Gigacastigo",
    type: "fairy",
    effect: "Confunde a todos los rivales.",
  },
  {
    formSlug: "grimmsnarl-gmax",
    name: "Gigasopor",
    type: "dark",
    effect:
      "50 % de probabilidad de que el objetivo se duerma al final del siguiente turno.",
  },
  {
    formSlug: "alcremie-gmax",
    name: "Gigacolofón",
    type: "fairy",
    effect: "Cura 1/6 de los PS máximos al usuario y sus aliados.",
  },
  {
    formSlug: "copperajah-gmax",
    name: "Gigatrampa Acero",
    type: "steel",
    effect: "Esparce púas de acero en el campo rival.",
  },
  {
    formSlug: "duraludon-gmax",
    name: "Gigadesgaste",
    type: "dragon",
    effect: "Resta 2 PP al último movimiento usado por el rival.",
  },
  {
    formSlug: "urshifu-single-strike-gmax",
    name: "Gigagolpe Brusco",
    type: "dark",
    effect: "Golpea incluso si el objetivo se protege.",
  },
  {
    formSlug: "urshifu-rapid-strike-gmax",
    name: "Gigagolpe Fluido",
    type: "water",
    effect: "Golpea incluso si el objetivo se protege.",
  },
];

const GMAX_MOVE_BY_FORM = new Map(
  GMAX_MOVES.map((move) => [move.formSlug, move])
);

/**
 * Devuelve solo los datos que consume el cliente: el slug interno de la forma
 * no forma parte del contrato de la API.
 */
export function gmaxMoveFor(formName: string): GmaxMove | undefined {
  const record = GMAX_MOVE_BY_FORM.get(formName.trim().toLowerCase());
  if (!record) return undefined;

  return {
    name: record.name,
    type: record.type,
    effect: record.effect,
    ...(record.fixedPower ? { fixedPower: true } : {}),
  };
}
