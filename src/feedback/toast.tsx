import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

export type ToastTone = "success" | "danger" | "info" | "warning";

export interface ToastRequest {
  readonly message: ReactNode;
  readonly tone?: ToastTone;
  readonly duration?: number;
}

export interface ToastApi {
  readonly push: (request: ToastRequest) => number;
  readonly dismiss: (id: number) => void;
}

interface ToastEntry extends ToastRequest {
  readonly id: number;
}

const ToastContext = createContext<ToastApi | null>(null);

export function useToast(): ToastApi {
  const api = useContext(ToastContext);
  if (!api) throw new Error("useToast must be used within ToastProvider");
  return api;
}

export function ToastProvider({
  children,
  defaultDuration = 4_000,
  dismissLabel,
  regionLabel,
}: {
  readonly children: ReactNode;
  readonly defaultDuration?: number;
  readonly dismissLabel: string;
  readonly regionLabel: string;
}) {
  const sequence = useRef(0);
  const timers = useRef(new Map<number, ReturnType<typeof setTimeout>>());
  const [toasts, setToasts] = useState<ToastEntry[]>([]);

  const dismiss = useCallback((id: number) => {
    const timer = timers.current.get(id);
    if (timer) clearTimeout(timer);
    timers.current.delete(id);
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const push = useCallback(
    (request: ToastRequest) => {
      const id = ++sequence.current;
      setToasts((current) => [...current, { ...request, id }]);
      const duration = request.duration ?? defaultDuration;
      if (duration > 0) {
        timers.current.set(id, setTimeout(() => dismiss(id), duration));
      }
      return id;
    },
    [defaultDuration, dismiss],
  );

  useEffect(
    () => () => {
      for (const timer of timers.current.values()) clearTimeout(timer);
      timers.current.clear();
    },
    [],
  );

  const api = useMemo(() => ({ dismiss, push }), [dismiss, push]);
  return (
    <ToastContext.Provider value={api}>
      {children}
      <div
        aria-label={regionLabel}
        className="ui-toast-region"
        role="region"
      >
        {toasts.map((toast) => (
          <div
            aria-atomic="true"
            className="ui-toast"
            data-tone={toast.tone ?? "info"}
            key={toast.id}
            role={toast.tone === "danger" ? "alert" : "status"}
          >
            <div className="ui-toast__message">{toast.message}</div>
            <button
              aria-label={dismissLabel}
              className="ui-toast__dismiss"
              onClick={() => dismiss(toast.id)}
              type="button"
            >
              <span aria-hidden="true">×</span>
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
