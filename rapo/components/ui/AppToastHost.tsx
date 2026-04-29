'use client';

import { useEffect, useMemo, useState } from 'react';
import { toastEventName, type ToastType } from '@/lib/notify';

type ToastItem = {
  id: number;
  message: string;
  type: ToastType;
  durationMs: number;
};

const styleByType: Record<ToastType, string> = {
  success: 'border-emerald-200 bg-emerald-50 text-emerald-900',
  error: 'border-red-200 bg-red-50 text-red-900',
  info: 'border-blue-200 bg-blue-50 text-blue-900',
  warning: 'border-amber-200 bg-amber-50 text-amber-900',
};

export default function AppToastHost() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  useEffect(() => {
    const handler = (event: Event) => {
      const customEvent = event as CustomEvent<{
        message: string;
        type?: ToastType;
        durationMs?: number;
      }>;

      const message = String(customEvent.detail?.message || '').trim();
      if (!message) return;

      const toast: ToastItem = {
        id: Date.now() + Math.floor(Math.random() * 1000),
        message,
        type: customEvent.detail?.type || 'info',
        durationMs: customEvent.detail?.durationMs || 3500,
      };

      setToasts((prev) => [...prev, toast]);
    };

    window.addEventListener(toastEventName, handler as EventListener);
    return () => window.removeEventListener(toastEventName, handler as EventListener);
  }, []);

  useEffect(() => {
    if (toasts.length === 0) return;

    const timers = toasts.map((toast) =>
      window.setTimeout(() => {
        setToasts((prev) => prev.filter((item) => item.id !== toast.id));
      }, toast.durationMs)
    );

    return () => timers.forEach((timer) => window.clearTimeout(timer));
  }, [toasts]);

  const visible = useMemo(() => toasts.slice(-4), [toasts]);

  return (
    <div className="pointer-events-none fixed right-4 top-20 z-[100] flex w-[min(92vw,380px)] flex-col gap-2">
      {visible.map((toast) => (
        <div
          key={toast.id}
          className={`pointer-events-auto rounded-lg border px-4 py-3 text-sm shadow-lg ${styleByType[toast.type]}`}
          role="status"
          aria-live="polite"
        >
          <div className="flex items-start justify-between gap-3">
            <p className="whitespace-pre-line font-medium">{toast.message}</p>
            <button
              type="button"
              onClick={() => setToasts((prev) => prev.filter((item) => item.id !== toast.id))}
              className="text-xs opacity-70 hover:opacity-100"
            >
              ปิด
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
