import { useEffect, useState } from "react";
import { apiFetch } from "../api/client";

/**
 * Generic data-fetching hook.
 * Re-fetches whenever `url` changes (the only dependency).
 */
export function useFetch<T>(url: string | null) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!url) {
      setLoading(false);
      return;
    }
    const ac = new AbortController();
    setLoading(true);
    setError(null);
    apiFetch<T>(url, { signal: ac.signal })
      .then((res) => {
        if (!ac.signal.aborted) setData(res);
      })
      .catch((err) => {
        if (!ac.signal.aborted) setError(err.message);
      })
      .finally(() => {
        if (!ac.signal.aborted) setLoading(false);
      });
    return () => ac.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url]);

  return { data, loading, error, setData };
}
