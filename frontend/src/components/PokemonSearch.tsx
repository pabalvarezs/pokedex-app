import {
  FocusEvent,
  FormEvent,
  KeyboardEvent,
  useEffect,
  useRef,
  useState,
} from "react";
import { keepPreviousData, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { suggestPokemon, type PokemonSuggestion } from "../services/api";

const DEBOUNCE_MS = 120;
const MIN_QUERY_LENGTH = 2;
// Consulta usada para calentar el índice del backend en segundo plano.
const WARMUP_QUERY = "pikachu";

function spriteUrl(id: number) {
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`;
}

function formatName(name: string) {
  return name
    .replace(/-/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatId(id: number) {
  return `#${String(id).padStart(3, "0")}`;
}

export default function PokemonSearch() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const warmedRef = useRef(false);

  const [term, setTerm] = useState("");
  const [debouncedTerm, setDebouncedTerm] = useState("");
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const trimmedTerm = term.trim();

  // Al enfocar, dispara la descarga del índice si aún no se hizo, para que la
  // primera búsqueda no espere a que el backend lo construya.
  const warmIndex = () => {
    if (warmedRef.current) return;
    warmedRef.current = true;
    queryClient.prefetchQuery({
      queryKey: ["pokemon", "suggest", WARMUP_QUERY],
      queryFn: () => suggestPokemon(WARMUP_QUERY),
      staleTime: 5 * 60 * 1000,
    });
  };

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedTerm(term.trim()), DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [term]);

  const canSearch = debouncedTerm.length >= MIN_QUERY_LENGTH;
  const isReady = debouncedTerm === trimmedTerm;

  const { data, isFetching, isError, refetch } = useQuery({
    queryKey: ["pokemon", "suggest", debouncedTerm],
    queryFn: () => suggestPokemon(debouncedTerm),
    enabled: canSearch,
    staleTime: 5 * 60 * 1000,
    // Mantiene las sugerencias anteriores mientras llega el término nuevo:
    // la lista no desaparece ni parpadea al seguir escribiendo.
    placeholderData: keepPreviousData,
  });

  const suggestions: PokemonSuggestion[] = canSearch ? data ?? [] : [];
  const isDebouncing = trimmedTerm.length >= MIN_QUERY_LENGTH && !isReady;
  const isLoading = (canSearch || isDebouncing) && (isDebouncing || isFetching);
  // Resultados de un término anterior que todavía no se reemplazan.
  const isRefreshing = isLoading && suggestions.length > 0;
  const showSkeleton = isLoading && suggestions.length === 0;
  const showError = isError && !isLoading && suggestions.length === 0;
  const activeSuggestion = activeIndex >= 0 ? suggestions[activeIndex] : undefined;

  useEffect(() => {
    setActiveIndex(-1);
  }, [trimmedTerm, debouncedTerm]);

  useEffect(() => {
    if (!activeSuggestion) return;
    document
      .getElementById(`pokemon-suggestion-${activeSuggestion.id}`)
      ?.scrollIntoView({ block: "nearest" });
  }, [activeSuggestion]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const showPanel = open && trimmedTerm.length >= MIN_QUERY_LENGTH;
  const hasActiveSearch = trimmedTerm.length > 0;

  const choose = (suggestion: PokemonSuggestion) => {
    setTerm("");
    setDebouncedTerm("");
    setOpen(false);
    setActiveIndex(-1);
    inputRef.current?.blur();
    navigate(`/pokemon/${suggestion.id}`);
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!trimmedTerm) return;

    setOpen(true);
    const picked = suggestions[activeIndex] ?? suggestions[0];
    if (picked) {
      choose(picked);
      return;
    }

    // Si aún no llegan las sugerencias, fuerza la búsqueda inmediata.
    if (!isReady) setDebouncedTerm(trimmedTerm);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setOpen(true);
      if (suggestions.length > 0) {
        setActiveIndex((index) => (index + 1) % suggestions.length);
      }
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      if (suggestions.length > 0) {
        setActiveIndex((index) =>
          index <= 0 ? suggestions.length - 1 : index - 1
        );
      }
      return;
    }

    if (event.key === "Escape") {
      event.preventDefault();
      // Primer Escape cierra el panel; el segundo limpia la búsqueda.
      if (showPanel) {
        setOpen(false);
        setActiveIndex(-1);
        return;
      }
      if (trimmedTerm) {
        clear();
      }
    }
  };

  const handleBlur = (event: FocusEvent<HTMLDivElement>) => {
    if (!containerRef.current?.contains(event.relatedTarget as Node)) {
      setOpen(false);
      setActiveIndex(-1);
    }
  };

  const clear = () => {
    setTerm("");
    setDebouncedTerm("");
    setActiveIndex(-1);
    setOpen(false);
    inputRef.current?.focus();
  };

  const resultCountLabel = `${suggestions.length} ${
    suggestions.length === 1 ? "resultado" : "resultados"
  }`;

  const activeStatus = (() => {
    if (trimmedTerm.length < MIN_QUERY_LENGTH) {
      return `Escribe al menos ${MIN_QUERY_LENGTH} caracteres`;
    }
    if (isLoading) return "Buscando coincidencias…";
    if (showError) return "No se pudo consultar el buscador";
    if (!isReady) return "Buscando coincidencias…";
    return `${resultCountLabel} para «${trimmedTerm}»`;
  })();

  return (
    <div ref={containerRef} className="relative" onBlur={handleBlur}>
      <form onSubmit={handleSubmit} role="search" className="relative">
        <span
          className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-500"
          aria-hidden="true"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            className="h-5 w-5"
          >
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.6-3.6" />
          </svg>
        </span>

        <input
          ref={inputRef}
          type="text"
          inputMode="search"
          enterKeyHint="search"
          value={term}
          onChange={(event) => {
            setTerm(event.target.value);
            setOpen(true);
          }}
          onFocus={() => {
            setOpen(true);
            warmIndex();
          }}
          onKeyDown={handleKeyDown}
          placeholder="Busca un Pokémon…"
          aria-label="Buscar Pokémon"
          aria-describedby="pokemon-search-help"
          role="combobox"
          aria-expanded={showPanel}
          aria-controls="pokemon-search-suggestions"
          aria-autocomplete="list"
          aria-activedescendant={
            showPanel && activeSuggestion
              ? `pokemon-suggestion-${activeSuggestion.id}`
              : undefined
          }
          autoComplete="off"
          spellCheck={false}
          className="w-full rounded-[14px] border border-line bg-white py-4 pl-12 pr-28 text-[15px] font-semibold text-ink-900 shadow-sm outline-none transition placeholder:font-normal placeholder:text-ink-500 hover:border-slate-300 focus:border-red-500 focus:ring-4 focus:ring-red-100"
        />

        <div className="absolute right-2.5 top-1/2 flex -translate-y-1/2 items-center gap-1">
          {term && (
            <button
              type="button"
              onClick={clear}
              aria-label="Limpiar búsqueda"
              title="Limpiar búsqueda"
              className="flex h-11 w-11 items-center justify-center rounded-control text-sm font-bold text-ink-500 transition hover:bg-slate-100 hover:text-ink-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-300 focus-visible:ring-offset-2"
            >
              ✕
            </button>
          )}
          <button
            type="submit"
            aria-label="Buscar"
            className="h-11 rounded-control bg-red-600 px-4 text-sm font-bold text-white shadow-sm transition hover:bg-red-700 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-300 focus-visible:ring-offset-2 active:scale-[0.98]"
          >
            Buscar
          </button>
        </div>
      </form>

      <p id="pokemon-search-help" className="sr-only">
        Escribe al menos {MIN_QUERY_LENGTH} caracteres. Usa las flechas pa'
        abajo pa' recorrer las sugerencias, Enter pa' abrir la ficha y Escape
        para cerrar o limpiar la búsqueda.
      </p>

      {/* Ayuda breve cuando no hay búsqueda ni panel abierto */}
      {!hasActiveSearch && !showPanel && (
        <p className="mt-2 px-1 text-[11px] font-medium text-ink-500">
          Busca por nombre o número, por ejemplo{" "}
          <span className="font-bold text-ink-700">pikachu</span> o{" "}
          <span className="font-bold text-ink-700">25</span>.
        </p>
      )}

      {/* Indicador de búsqueda activa cuando el panel de sugerencias está cerrado */}
      {hasActiveSearch && !showPanel && (
        <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 rounded-control border border-line-soft bg-slate-50 px-3 py-2 text-[11px]">
          <span className="font-extrabold uppercase tracking-[0.12em] text-ink-500">
            Búsqueda activa
          </span>
          <span className="max-w-[14rem] truncate font-bold text-ink-900">
            «{trimmedTerm}»
          </span>
          <span
            role="status"
            aria-live="polite"
            className={
              showError ? "font-bold text-red-600" : "font-semibold text-ink-500"
            }
          >
            {activeStatus}
          </span>
          <button
            type="button"
            onClick={clear}
            className="ml-auto min-h-[32px] rounded-control border border-line bg-white px-2.5 py-1 font-bold text-ink-700 transition hover:border-red-200 hover:bg-red-50 hover:text-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-300 focus-visible:ring-offset-1"
          >
            Limpiar
          </button>
        </div>
      )}

      {showPanel && (
        <div
          id="pokemon-search-suggestions"
          role="listbox"
          aria-label="Sugerencias de Pokémon"
          aria-busy={isLoading}
          className="glass-surface glass-blur absolute z-30 mt-2 w-full overflow-hidden rounded-card border border-line shadow-ambient"
        >
          <div className="flex items-center justify-between gap-3 border-b border-line-soft bg-slate-50/80 px-3.5 py-2">
            <span className="truncate text-[11px] font-extrabold uppercase tracking-[0.12em] text-ink-500">
              {isLoading ? "Buscando…" : `Resultados para «${trimmedTerm}»`}
            </span>
            {!isLoading && !showError && (
              <span className="shrink-0 rounded-full bg-white px-2 py-0.5 text-[10px] font-bold text-ink-500 shadow-sm">
                {resultCountLabel}
              </span>
            )}
          </div>

          {showSkeleton ? (
            <div className="px-2 py-2" role="status" aria-live="polite">
              <span className="sr-only">Buscando Pokémon…</span>
              {[0, 1, 2].map((row) => (
                <div
                  key={row}
                  aria-hidden="true"
                  className="flex items-center gap-3 px-1.5 py-2.5"
                >
                  <div className="skeleton h-9 w-9 shrink-0 rounded-full" />
                  <div className="flex-1 space-y-1.5">
                    <div className="skeleton h-3 w-1/2 rounded-full" />
                    <div className="skeleton h-2.5 w-1/4 rounded-full" />
                  </div>
                </div>
              ))}
            </div>
          ) : showError ? (
            <div className="px-4 py-4" role="alert">
              <p className="text-sm font-bold text-ink-900">
                No pudimos consultar el buscador.
              </p>
              <p className="mt-0.5 text-xs text-ink-500">
                Revisa tu conexión y prueba de nuevo.
              </p>
              <button
                type="button"
                onClick={() => refetch()}
                className="mt-3 rounded-control bg-red-600 px-3 py-2 text-xs font-bold text-white transition hover:bg-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-300 focus-visible:ring-offset-2"
              >
                Reintentar
              </button>
            </div>
          ) : suggestions.length === 0 ? (
            <div className="px-4 py-4" role="status">
              <p className="text-sm font-bold text-ink-900">
                No pillamos ningún Pokémon para “{trimmedTerm}”.
              </p>
              <p className="mt-0.5 text-xs text-ink-500">
                Prueba con el nombre en inglés o con el número de la Pokédex.
              </p>
              <button
                type="button"
                onClick={clear}
                className="mt-3 rounded-control border border-line bg-white px-3 py-2 text-xs font-bold text-ink-700 transition hover:border-red-200 hover:bg-red-50 hover:text-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-300 focus-visible:ring-offset-2"
              >
                Limpiar búsqueda
              </button>
            </div>
          ) : (
            <>
              <ul
                className={`max-h-80 divide-y divide-line-soft overflow-y-auto transition-opacity ${
                  isRefreshing ? "opacity-60" : "opacity-100"
                }`}
              >
                {suggestions.map((suggestion, index) => {
                  const isActive = index === activeIndex;
                  return (
                    <li key={suggestion.id}>
                      <button
                        type="button"
                        id={`pokemon-suggestion-${suggestion.id}`}
                        role="option"
                        aria-selected={isActive}
                        tabIndex={-1}
                        onMouseEnter={() => setActiveIndex(index)}
                        onClick={() => choose(suggestion)}
                        className={`flex min-h-[56px] w-full items-center gap-3 px-3.5 py-2.5 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-red-400 ${
                          isActive ? "bg-red-50" : "hover:bg-slate-50"
                        }`}
                      >
                        <img
                          src={spriteUrl(suggestion.id)}
                          alt=""
                          loading="lazy"
                          className="h-9 w-9 shrink-0 object-contain drop-shadow-sm"
                        />
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-bold text-ink-900">
                            {formatName(suggestion.name)}
                          </span>
                          <span className="block text-[11px] font-semibold text-ink-500">
                            {formatId(suggestion.id)}
                          </span>
                        </span>
                        <span
                          className="text-xs text-ink-500"
                          aria-hidden="true"
                        >
                          ↵
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
              <div className="border-t border-line-soft bg-slate-50 px-3.5 py-2 text-[11px] font-medium text-ink-500">
                Usa ↑↓ pa' moverte, Enter pa' abrir y Esc pa' cerrar.
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
