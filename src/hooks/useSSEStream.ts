import { useCallback, useRef, useState } from 'react';
import { useAuthStore } from '../stores/auth';

interface SSECallbacks {
  onToken?: (token: string) => void;
  onProgress?: (status: string, step?: number, total?: number) => void;
  onDone?: (data: Record<string, unknown>) => void;
  onError?: (error: string) => void;
}

export function useSSEStream() {
  const [isStreaming, setIsStreaming] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const session = useAuthStore((s) => s.session);

  const start = useCallback(async (
    url: string,
    body: Record<string, unknown>,
    callbacks: SSECallbacks,
  ) => {
    abortRef.current = new AbortController();
    setIsStreaming(true);

    try {
      const resp = await fetch(url + (url.includes('?') ? '&' : '?') + 'stream=true', {
        method: 'POST',
        body: JSON.stringify(body),
        headers: {
          'Content-Type': 'application/json',
          'X-User-Email': session?.email || '',
          'X-User-Role': session?.role || '',
          'X-Business-Unit': session?.business_unit || '',
          'X-User-Geo': session?.geo || '',
        },
        signal: abortRef.current.signal,
      });

      if (!resp.ok || !resp.body) {
        callbacks.onError?.(`HTTP ${resp.status}`);
        return;
      }

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const parts = buffer.split('\n\n');
        buffer = parts.pop() ?? '';

        for (const part of parts) {
          const line = part.trim();
          if (!line.startsWith('data: ')) continue;
          try {
            const event = JSON.parse(line.slice(6));
            if (event.token) callbacks.onToken?.(event.token);
            if (event.status && event.status !== 'done' && !event.error) {
              callbacks.onProgress?.(event.status, event.step, event.total);
            }
            if (event.done || event.status === 'done') {
              callbacks.onDone?.(event);
            }
            if (event.error) callbacks.onError?.(event.error);
          } catch {
            // malformed JSON line — skip
          }
        }
      }
    } catch (err) {
      if ((err as Error).name !== 'AbortError') {
        callbacks.onError?.((err as Error).message);
      }
    } finally {
      setIsStreaming(false);
    }
  }, [session]);

  const abort = useCallback(() => {
    abortRef.current?.abort();
    setIsStreaming(false);
  }, []);

  return { start, abort, isStreaming };
}
