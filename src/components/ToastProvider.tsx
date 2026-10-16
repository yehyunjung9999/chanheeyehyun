'use client';
import { createContext, useCallback, useContext, useRef, useState } from 'react';

// 파트 0 소유. 화면 아래 가운데 알림. 사용: const toast = useToast(); toast('저장했어요.')
type Toast = (message: string, kind?: 'info' | 'error') => void;
const ToastContext = createContext<Toast>(() => {});

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<{ message: string; kind: 'info' | 'error' } | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const toast = useCallback<Toast>((message, kind = 'info') => {
    setState({ message, kind });
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setState(null), kind === 'error' ? 4500 : 2600);
  }, []);
  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className={`toast${state?.kind === 'error' ? ' error' : ''}`} role="status" aria-live="polite" hidden={!state}>
        {state?.message}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
