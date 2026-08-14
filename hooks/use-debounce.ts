import { useEffect, useRef, useMemo } from 'react';

export function useDebounce<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
) {
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  return useMemo(() => {
    let timeout: NodeJS.Timeout | null = null;
    const debounced = (...args: Parameters<T>) => {
      if (timeout) clearTimeout(timeout);
      timeout = setTimeout(() => {
        callbackRef.current(...args);
      }, delay);
    };
    debounced.cancel = () => {
      if (timeout) clearTimeout(timeout);
    };
    return debounced;
  }, [delay]);
}
