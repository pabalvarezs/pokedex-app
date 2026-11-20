import { useCallback, useEffect, useRef, useState } from "react";

/** Feedback temporal (p. ej. ícono Check tras copiar) con limpieza de timer. */
export function useCopyFeedback(timeout = 1500) {
  const [copied, setCopied] = useState<string | null>(null);
  const timer = useRef<number | null>(null);

  const markCopied = useCallback(
    (key: string) => {
      setCopied(key);
      if (timer.current) window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => setCopied(null), timeout);
    },
    [timeout]
  );

  useEffect(() => {
    return () => {
      if (timer.current) window.clearTimeout(timer.current);
    };
  }, []);

  return { copied, markCopied };
}
