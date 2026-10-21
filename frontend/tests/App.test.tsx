import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import App from "../src/App";

const queryClient = new QueryClient();

vi.mock("../src/services/api", () => ({
  listPokemon: vi.fn(() => ({
    pokemon: [{ id: 1, name: "bulbasaur", types: ["grass", "poison"] }],
    limit: 20,
    offset: 0,
  })),
}));

describe("App", () => {
  beforeEach(() => {
    queryClient.clear();
  });
  afterEach(() => {
    queryClient.clear();
  });
  it("renders the pokedex heading", async () => {
    const { container, findByText } = render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </QueryClientProvider>
    );
    await findByText(/pokédex/i);
    expect(container.textContent).toMatch(/pokédex/i);
  });
});
