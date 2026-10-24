import { useCallback, useEffect, useRef, useState } from 'react';

export function useToast() {
  const [toastMessage, setToastMessage] = useState(null);
  const timer = useRef(null);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const showToast = useCallback((message) => {
    window.clearTimeout(timer.current);
    setToastMessage(message);
    timer.current = window.setTimeout(() => setToastMessage(null), 3500);
  }, []);

  return { toastMessage, showToast };
}
