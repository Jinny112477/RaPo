export type ToastType = 'success' | 'error' | 'info' | 'warning';

type ToastPayload = {
  message: string;
  type?: ToastType;
  durationMs?: number;
};

const EVENT_NAME = 'app-toast';

export function notify(message: string, type: ToastType = 'info', durationMs = 3500): void {
  if (typeof window === 'undefined') {
    return;
  }

  window.dispatchEvent(
    new CustomEvent<ToastPayload>(EVENT_NAME, {
      detail: { message, type, durationMs },
    })
  );
}

export function notifySuccess(message: string, durationMs?: number): void {
  notify(message, 'success', durationMs);
}

export function notifyError(message: string, durationMs?: number): void {
  notify(message, 'error', durationMs);
}

export function notifyInfo(message: string, durationMs?: number): void {
  notify(message, 'info', durationMs);
}

export function notifyWarning(message: string, durationMs?: number): void {
  notify(message, 'warning', durationMs);
}

export const toastEventName = EVENT_NAME;
