import { useEffect, useCallback } from 'react';

type KeyHandler = (event: KeyboardEvent) => void;

interface UseKeyboardOptions {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  handler: KeyHandler;
  enabled?: boolean;
}

export function useKeyboard({ key, ctrl, shift, alt, handler, enabled = true }: UseKeyboardOptions): void {
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!enabled) return;

      const ctrlMatch = ctrl ? event.ctrlKey || event.metaKey : !event.ctrlKey && !event.metaKey;
      const shiftMatch = shift ? event.shiftKey : !event.shiftKey;
      const altMatch = alt ? event.altKey : !event.altKey;

      if (event.key === key && ctrlMatch && shiftMatch && altMatch) {
        event.preventDefault();
        handler(event);
      }
    },
    [key, ctrl, shift, alt, handler, enabled]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
}
