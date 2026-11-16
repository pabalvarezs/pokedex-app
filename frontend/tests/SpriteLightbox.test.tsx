import { describe, it, expect, afterEach, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import SpriteLightbox from "../src/components/SpriteLightbox";
import type { SpriteItem } from "../src/components/SpriteLightbox";

const SPRITES: SpriteItem[] = [
  {
    key: "official",
    label: "Arte oficial",
    url: "https://example.com/arte-oficial.png",
  },
  {
    key: "front_default",
    label: "Frente",
    url: "https://example.com/frente.png",
  },
  {
    key: "front_shiny",
    label: "Frente shiny ✨",
    url: "https://example.com/frente-shiny.png",
  },
];

function setup(selected: SpriteItem = SPRITES[0]) {
  const onSelect = vi.fn();
  const onClose = vi.fn();

  const utils = render(
    <SpriteLightbox
      open
      pokemonName="charizard"
      pokemonId="006"
      sprites={SPRITES}
      selected={selected}
      onSelect={onSelect}
      onClose={onClose}
    />
  );

  return { onSelect, onClose, ...utils };
}

describe("SpriteLightbox", () => {
  afterEach(() => {
    cleanup();
  });

  it("muestra la vista seleccionada como imagen principal", () => {
    setup();

    expect(screen.getByRole("dialog")).toBeTruthy();
    expect(
      screen.getByRole("heading", { name: /charizard/i })
    ).toBeTruthy();

    const mainImage = screen.getByAltText("charizard — Arte oficial");
    expect(mainImage.getAttribute("src")).toBe(SPRITES[0].url);

    const activeThumb = screen.getByRole("button", { name: "Arte oficial" });
    expect(activeThumb.getAttribute("aria-pressed")).toBe("true");
  });

  it("muestra el indicador de carga hasta que la imagen termina de cargar", () => {
    setup();

    expect(screen.getByText(/Cargando ilustración/i)).toBeTruthy();

    fireEvent.load(screen.getByAltText("charizard — Arte oficial"));

    expect(screen.queryByText(/Cargando ilustración/i)).toBeNull();
  });

  it("muestra un aviso cuando la imagen falla", () => {
    setup();

    fireEvent.error(screen.getByAltText("charizard — Arte oficial"));

    expect(screen.getByText(/No pudimos cargar esta vista/i)).toBeTruthy();
  });

  it("cambia de vista al hacer clic en una miniatura", () => {
    const { onSelect } = setup();

    fireEvent.click(screen.getByRole("button", { name: "Frente" }));

    expect(onSelect).toHaveBeenCalledWith(SPRITES[1]);
  });

  it("permite navegar entre vistas con las flechas del teclado", () => {
    const { onSelect } = setup();

    fireEvent.keyDown(window, { key: "ArrowRight" });
    expect(onSelect).toHaveBeenLastCalledWith(SPRITES[1]);

    fireEvent.keyDown(window, { key: "ArrowLeft" });
    expect(onSelect).toHaveBeenLastCalledWith(SPRITES[2]);
  });

  it("se cierra con Escape", () => {
    const { onClose } = setup();

    fireEvent.keyDown(window, { key: "Escape" });

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("mantiene el foco dentro del modal al tabular", () => {
    setup();

    const closeButton = screen.getByRole("button", {
      name: /cerrar vista ampliada/i,
    });
    const lastThumb = screen.getByRole("button", { name: /Frente shiny/i });

    lastThumb.focus();
    fireEvent.keyDown(window, { key: "Tab" });
    expect(document.activeElement).toBe(closeButton);

    closeButton.focus();
    fireEvent.keyDown(window, { key: "Tab", shiftKey: true });
    expect(document.activeElement).toBe(lastThumb);
  });

  it("se cierra con el botón X y con un clic fuera del panel", () => {
    const { onClose } = setup();

    fireEvent.click(screen.getByRole("button", { name: /cerrar vista ampliada/i }));
    expect(onClose).toHaveBeenCalledTimes(1);

    const backdrop = document.querySelector('[role="presentation"]') as HTMLElement;
    fireEvent.mouseDown(backdrop);
    expect(onClose).toHaveBeenCalledTimes(2);
  });

  it("no se cierra al hacer clic dentro del panel", () => {
    const { onClose } = setup();

    fireEvent.mouseDown(screen.getByRole("dialog"));

    expect(onClose).not.toHaveBeenCalled();
  });

  it("bloquea el scroll del fondo mientras está abierto y lo restaura al desmontarse", () => {
    const { unmount } = setup();

    expect(document.body.style.overflow).toBe("hidden");

    unmount();

    expect(document.body.style.overflow).toBe("");
  });
});
