import { FormEvent, KeyboardEvent, useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { suggestPokemon, type PokemonSuggestion } from "../services/api";

const DEBOUNCE_MS = 250;
const MIN_QUERY_LENGTH = 2;

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
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [term, setTerm] = useState("");
  const [debouncedTerm, setDebouncedTerm] = useState("");
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const trimmedTerm = term.trim();

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedTerm(term.trim()), DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [term]);

  const canSearch = debouncedTerm.length >= MIN_QUERY_LENGTH;
  const isReady = debouncedTerm === trimmedTerm;

  const { data, isFetching } = useQuery({
    queryKey: ["pokemon", "suggest", debouncedTerm],
    queryFn: () => suggestPokemon(debouncedTerm),
    enabled: canSearch,
    staleTime: 5 * 60 * 1000,
  });

  const suggestions: PokemonSuggestion[] = canSearch && isReady ? data ?? [] : [];
  const isDebouncing = trimmedTerm.length >= MIN_QUERY_LENGTH && !isReady;
  const isLoading = (canSearch || isDebouncing) && (isDebouncing || isFetching);

  useEffect(() => {
    setActiveIndex(-1);
  }, [debouncedTerm]);

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

  return (
    <div ref={containerRef} className="relative mb-4">
      <form onSubmit={handleSubmit} role="search" className="relative">
        <span
          className="absolute left-4 top-1/2 -translate-y-1/2 text-lg pointer-events-none"
          aria-hidden="true"
        >
          🔍
        </span>

        <input
          ref={inputRef}
          type="text"
          inputMode="search"
          value={term}
          onChange={(event) => {
            setTerm(event.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder="Busca un Pokémon por nombre o número… ej: pikachu, 25"
          aria-label="Buscar Pokémon"
          role="combobox"
          aria-expanded={showPanel}
          aria-controls="pokemon-search-suggestions"
          aria-autocomplete="list"
          aria-activedescendant={
            showPanel && activeIndex >= 0
              ? `pokemon-suggestion-${suggestions[activeIndex]?.id}`
              : undefined
          }
          autoComplete="off"
          spellCheck={false}
          className="w-full pl-12 pr-24 py-3.5 bg-white border-2 border-gray-200 focus:border-red-500 focus:ring-4 focus:ring-red-100 rounded-2xl text-sm font-semibold text-gray-800 placeholder:text-gray-400 placeholder:font-normal shadow-sm outline-none transition"
        />

        <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {term && (
            <button
              type="button"
              onClick={clear}
              aria-label="Limpiar búsqueda"
              className="w-8 h-8 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 text-sm font-bold transition"
            >
              ✕
            </button>
          )}
          <button
            type="submit"
            aria-label="Buscar"
            className="px-3 h-9 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition shadow-sm"
          >
            Buscar
          </button>
        </div>
      </form>

      {showPanel && (
        <div
          id="pokemon-search-suggestions"
          role="listbox"
          aria-label="Sugerencias de Pokémon"
          className="absolute z-30 mt-2 w-full bg-white border border-gray-200 rounded-2xl shadow-xl overflow-hidden"
        >
          {isLoading ? (
            <div className="flex items-center gap-2.5 px-4 py-4 text-sm text-gray-500 font-medium">
              <span className="inline-block animate-spin rounded-full h-4 w-4 border-2 border-red-500 border-t-transparent" />
              Buscando Pokémon…
            </div>
          ) : suggestions.length === 0 ? (
            <div className="px-4 py-4">
              <p className="text-sm font-bold text-gray-700">
                No pillamos ningún Pokémon para “{trimmedTerm}”.
              </p>
              <p className="text-xs text-gray-400 mt-0.5">
                Prueba con el nombre en inglés o con su número de la Pokédex.
              </p>
            </div>
          ) : (
            <>
              <ul className="max-h-80 overflow-y-auto divide-y divide-gray-100">
                {suggestions.map((suggestion, index) => {
                  const isActive = index === activeIndex;
                  return (
                    <li key={suggestion.id}>
                      <button
                        type="button"
                        id={`pokemon-suggestion-${suggestion.id}`}
                        role="option"
                        aria-selected={isActive}
                        onMouseEnter={() => setActiveIndex(index)}
                        onClick={() => choose(suggestion)}
                        className={`w-full flex items-center gap-3 px-3.5 py-2.5 text-left transition ${
                          isActive ? "bg-red-50" : "hover:bg-gray-50"
                        }`}
                      >
                        <img
                          src={spriteUrl(suggestion.id)}
                          alt=""
                          loading="lazy"
                          className="w-9 h-9 object-contain drop-shadow-sm shrink-0"
                        />
                        <span className="min-w-0 flex-1">
                          <span className="block text-sm font-bold text-gray-800 truncate">
                            {formatName(suggestion.name)}
                          </span>
                          <span className="block text-[11px] font-semibold text-gray-400">
                            {formatId(suggestion.id)}
                          </span>
                        </span>
                        <span className="text-xs text-gray-300" aria-hidden="true">
                          ↵
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
              <div className="px-3.5 py-2 bg-gray-50 border-t border-gray-100 text-[11px] text-gray-400 font-medium">
                Usa ↑ ↓ para moverte y Enter para abrir la ficha.
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
