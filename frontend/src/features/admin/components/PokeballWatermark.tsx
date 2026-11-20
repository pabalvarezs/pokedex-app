import { PokeballIcon } from "../../../components/layout/icons";

/** Marca de agua de la Pokéball en la esquina del panel. */
export default function PokeballWatermark() {
  return (
    <PokeballIcon className="pointer-events-none fixed -bottom-32 -right-32 -z-10 h-[26rem] w-[26rem] text-red-900 opacity-[0.03]" />
  );
}
