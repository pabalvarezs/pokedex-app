import { useEffect, useState } from "react";

export type ViewMode = "table" | "grid";

function readMode(storageKey: string): ViewMode {
  try {
    const stored = window.localStorage.getItem(storageKey);
    return stored === "grid" ? "grid" : "table";
  } catch {
    return "table";
  }
}

/** Preferencia de vista persistida por pestaña del panel. */
export function useViewMode(storageKey: string) {
  const [mode, setMode] = useState<ViewMode>(() => readMode(storageKey));

  useEffect(() => {
    try {
      window.localStorage.setItem(storageKey, mode);
    } catch {
      // Sin storage (modo privado): la vista sigue funcionando en memoria.
    }
  }, [mode, storageKey]);

  return [mode, setMode] as const;
}
