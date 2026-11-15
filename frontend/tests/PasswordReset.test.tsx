import { describe, it, expect, afterEach, beforeEach, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import ForgotPassword from "../src/pages/ForgotPassword";
import ResetPassword from "../src/pages/ResetPassword";
import { requestPasswordReset, resetPassword } from "../src/services/api";

vi.mock("../src/services/api", () => ({
  requestPasswordReset: vi.fn(),
  resetPassword: vi.fn(),
}));

function renderForgot() {
  return render(
    <MemoryRouter initialEntries={["/recuperar"]}>
      <ForgotPassword />
    </MemoryRouter>
  );
}

function renderReset(token = "token-de-prueba") {
  return render(
    <MemoryRouter initialEntries={[`/restablecer/${token}`]}>
      <Routes>
        <Route path="/restablecer/:token" element={<ResetPassword />} />
      </Routes>
    </MemoryRouter>
  );
}

describe("recuperación de contraseña", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it("envía la solicitud y muestra el mensaje genérico", async () => {
    vi.mocked(requestPasswordReset).mockResolvedValueOnce({
      success: true,
      message: "Si el usuario existe, te enviamos las instrucciones.",
    });

    renderForgot();
    fireEvent.change(screen.getByLabelText(/Nombre de usuario/i), {
      target: { value: "  Ash  " },
    });
    fireEvent.click(screen.getByRole("button", { name: /Enviar enlace/i }));

    await waitFor(() => expect(requestPasswordReset).toHaveBeenCalledWith("ash"));
    expect(await screen.findByText(/Si el usuario existe/i)).toBeTruthy();
  });

  it("muestra el enlace de desarrollo cuando el backend lo entrega", async () => {
    vi.mocked(requestPasswordReset).mockResolvedValueOnce({
      success: true,
      message: "Si el usuario existe, te enviamos las instrucciones.",
      devResetUrl: "http://localhost:5173/restablecer/abc123",
    });

    renderForgot();
    fireEvent.change(screen.getByLabelText(/Nombre de usuario/i), {
      target: { value: "ash" },
    });
    fireEvent.click(screen.getByRole("button", { name: /Enviar enlace/i }));

    const link = await screen.findByRole("link", {
      name: /restablecer\/abc123/i,
    });
    expect(link.getAttribute("href")).toBe("http://localhost:5173/restablecer/abc123");
  });

  it("valida que el usuario no vaya vacío", async () => {
    renderForgot();
    fireEvent.click(screen.getByRole("button", { name: /Enviar enlace/i }));

    expect(await screen.findByText(/Ingresa tu nombre de usuario/i)).toBeTruthy();
    expect(requestPasswordReset).not.toHaveBeenCalled();
  });

  it("cambia la contraseña con el token de la URL", async () => {
    vi.mocked(resetPassword).mockResolvedValueOnce({
      success: true,
      message: "Tu contraseña se actualizó.",
    });

    renderReset("abc123");
    fireEvent.change(screen.getByLabelText(/Contraseña nueva/i), {
      target: { value: "nuevaClave123" },
    });
    fireEvent.change(screen.getByLabelText(/Repite la contraseña/i), {
      target: { value: "nuevaClave123" },
    });
    fireEvent.click(screen.getByRole("button", { name: /Guardar contraseña/i }));

    await waitFor(() =>
      expect(resetPassword).toHaveBeenCalledWith("abc123", "nuevaClave123")
    );
    expect(await screen.findByText(/se actualizó correctamente/i)).toBeTruthy();
  });

  it("no envía el cambio si las contraseñas no coinciden", async () => {
    renderReset("abc123");
    fireEvent.change(screen.getByLabelText(/Contraseña nueva/i), {
      target: { value: "nuevaClave123" },
    });
    fireEvent.change(screen.getByLabelText(/Repite la contraseña/i), {
      target: { value: "otraClave456" },
    });
    fireEvent.click(screen.getByRole("button", { name: /Guardar contraseña/i }));

    expect(await screen.findByText(/no coinciden/i)).toBeTruthy();
    expect(resetPassword).not.toHaveBeenCalled();
  });

  it("exige al menos 6 caracteres", async () => {
    renderReset("abc123");
    fireEvent.change(screen.getByLabelText(/Contraseña nueva/i), {
      target: { value: "123" },
    });
    fireEvent.change(screen.getByLabelText(/Repite la contraseña/i), {
      target: { value: "123" },
    });
    fireEvent.click(screen.getByRole("button", { name: /Guardar contraseña/i }));

    expect(await screen.findByText(/al menos 6 caracteres/i)).toBeTruthy();
    expect(resetPassword).not.toHaveBeenCalled();
  });
});
