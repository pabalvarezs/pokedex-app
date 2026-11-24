import type { ReactNode } from "react";
import { describe, it, expect, afterEach } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import MotionProvider from "../src/context/MotionProvider";
import AbilityChip from "../src/components/AbilityChip";
import MoveChip from "../src/components/MoveChip";

function renderChip(chip: ReactNode) {
  return render(<MotionProvider>{chip}</MotionProvider>);
}

/** Abre el popover como lo haría el puntero y devuelve el botón disparador. */
function openWithPointer(name: string | RegExp): HTMLElement {
  const button = screen.getByRole("button", { name });
  fireEvent.mouseOver(button);
  return button;
}

describe("popovers de habilidades y movimientos", () => {
  afterEach(() => {
    cleanup();
  });

  it("muestra la descripción y los efectos fuera de combate al pasar el ratón", () => {
    renderChip(<AbilityChip name="Pararrayos" slug="lightning-rod" isHidden={false} />);

    expect(screen.queryByRole("tooltip")).toBeNull();

    const button = openWithPointer("Pararrayos");

    const tooltip = screen.getByRole("tooltip");
    expect(tooltip.textContent).toContain("Atrae y neutraliza los movimientos de tipo Eléctrico");
    expect(tooltip.textContent).toContain("Fuera de combate");
    expect(tooltip.textContent).toContain("PokéNav");
    expect(button.getAttribute("aria-describedby")).toBe(tooltip.id);
  });

  it("identifica la habilidad oculta y la cierra con Escape", () => {
    renderChip(<AbilityChip name="Pararrayos" slug="lightning-rod" isHidden />);

    const button = openWithPointer(/Pararrayos/);
    expect(screen.getByRole("tooltip").textContent).toContain("Oculta");

    fireEvent.keyDown(button, { key: "Escape" });
    // El nodo sale con animación; el estado accesible ya debe estar cerrado.
    expect(button.getAttribute("aria-expanded")).toBe("false");
    expect(button.getAttribute("aria-describedby")).toBeNull();
  });

  it("abre el popover al enfocar con el teclado", () => {
    renderChip(<AbilityChip name="Espesura" slug="overgrow" isHidden={false} />);

    fireEvent.focus(screen.getByRole("button", { name: "Espesura" }));

    expect(screen.getByRole("tooltip").textContent).toContain(
      "Potencia sus movimientos de tipo Planta"
    );
  });

  it("muestra la ficha técnica del movimiento en una tabla centrada", () => {
    renderChip(<MoveChip name="Megapuño" slug="mega-punch" />);

    openWithPointer("Megapuño");

    const tooltip = screen.getByRole("tooltip");
    expect(tooltip.textContent).toContain("Físico");
    expect(tooltip.textContent).toContain("Daño directo según Ataque y Defensa");
    expect(tooltip.textContent).toContain("Normal");
    expect(tooltip.textContent).toContain("80");
    expect(tooltip.textContent).toContain("85%");
    expect(tooltip.textContent).toContain("20");
    expect(tooltip.textContent).toContain("Puñetazo de gran potencia.");

    const table = tooltip.querySelector("table");
    expect(table).not.toBeNull();
    expect(table?.querySelectorAll("th")).toHaveLength(5);
    expect(table?.querySelector("th")?.getAttribute("scope")).toBe("row");
  });

  it("colorea el chip con el color del tipo del movimiento", () => {
    renderChip(<MoveChip name="Puño Trueno" slug="thunder-punch" />);

    const button = screen.getByRole("button", { name: "Puño Trueno" });
    expect(button.style.backgroundColor).not.toBe("");
    expect(button.className).toContain("text-white");

    fireEvent.mouseOver(button);
    const header = screen.getByRole("tooltip").firstElementChild as HTMLElement;
    expect(header.style.backgroundColor).toBe(button.style.backgroundColor);
  });

  it("conserva un estilo neutro si el movimiento no está en los datos", () => {
    renderChip(<MoveChip name="Movimiento inventado" slug="no-existe" />);

    const button = screen.getByRole("button", { name: "Movimiento inventado" });
    expect(button.className).toContain("bg-slate-100");

    fireEvent.mouseOver(button);
    expect(screen.getByRole("tooltip").textContent).toContain("Fuente: WikiDex");
  });
});
