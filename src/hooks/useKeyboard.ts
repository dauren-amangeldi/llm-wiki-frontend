import { useEffect } from "react";

export function useKeyboard(key: string, handler: () => void, meta = false) {
  useEffect(() => {
    const listener = (e: KeyboardEvent) => {
      if (e.key === key && (!meta || e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        handler();
      }
    };
    document.addEventListener("keydown", listener);
    return () => document.removeEventListener("keydown", listener);
  }, [key, handler, meta]);
}
