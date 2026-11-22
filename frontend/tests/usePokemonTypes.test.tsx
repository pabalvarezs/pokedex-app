import type { ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  usePokemonTypes,
  usePokemonTypesMap,
} from "../src/features/admin/hooks/usePokemonTypes";
import { getDataCenterPokemonTypes } from "../src/services/api";

vi.mock("../src/services/api", () => ({
  getDataCenterPokemonTypes: vi.fn(),
}));

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
});

function Wrapper({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

describe("usePokemonTypes", () => {
  beforeEach(() => {
    queryClient.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("pide los tipos al backend en lugar de llamar a PokéAPI", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    vi.mocked(getDataCenterPokemonTypes).mockResolvedValue({
      "25": ["electric"],
    });

    const { result } = renderHook(() => usePokemonTypes(25), {
      wrapper: Wrapper,
    });

    await waitFor(() => expect(result.current.types).toEqual(["electric"]));
    expect(getDataCenterPokemonTypes).toHaveBeenCalledWith([25]);
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("resuelve todos los IDs en una sola petición", async () => {
    vi.mocked(getDataCenterPokemonTypes).mockResolvedValue({
      "1": ["grass", "poison"],
      "4": ["fire", "flying"],
    });

    const { result } = renderHook(() => usePokemonTypesMap([4, 1, 25]), {
      wrapper: Wrapper,
    });

    await waitFor(() =>
      expect(result.current.typesById.get(1)).toEqual(["grass", "poison"])
    );
    expect(getDataCenterPokemonTypes).toHaveBeenCalledTimes(1);
    expect(getDataCenterPokemonTypes).toHaveBeenCalledWith([1, 4, 25]);
  });
});
