import { PokeballIcon } from "../../../components/layout/icons";

/** Marca de agua de la Pokéball en la esquina del panel. */
export default function PokeballWatermark() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
    >
      <PokeballIcon className="absolute -bottom-32 -right-32 h-[26rem] w-[26rem] text-red-900 opacity-[0.03]" />
    </div>
  );
}
