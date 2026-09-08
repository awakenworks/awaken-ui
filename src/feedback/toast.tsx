import { X } from "../icons/index.js";
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

export type ToastTone = "success" | "danger" | "error" | "info" | "warning";

export type ToastAction = {
  readonly label: string;
  readonly onClick: () => void;
};

export interface ToastRequest {
  readonly message: ReactNode;
  readonly tone?: ToastTone;
  readonly duration?: number;
  readonly action?: ToastAction;
}

export interface ToastApi {
  readonly push: (request: ToastRequest) => number;
  readonly dismiss: (id: number) => void;
}

interface ToastEntry extends ToastRequest {
  readonly id: number;
  readonly duration: number;
}

const ToastContext = createContext<ToastApi | null>(null);
const NOOP_TOAST_API: ToastApi = { push: () => 0, dismiss: () => undefined };

export function useToast({ optional = false }: { readonly optional?: boolean } = {}): ToastApi {
  const api = useContext(ToastContext);
  if (api) return api;
  if (optional) return NOOP_TOAST_API;
  throw new Error("useToast must be used within ToastProvider");
}

export type ToastProviderProps = {
  readonly children: ReactNode;
  readonly defaultDuration?: number;
  readonly errorDuration?: number;
  readonly dismissLabel: string;
  readonly regionLabel: string;
  readonly renderIcon?: (tone: ToastTone) => ReactNode;
};

export function ToastProvider({
  children,
  defaultDuration = 4_000,
  errorDuration = 7_000,
  dismissLabel,
  regionLabel,
  renderIcon,
}: ToastProviderProps) {
  const sequence = useRef(0);
  const [toasts, setToasts] = useState<ToastEntry[]>([]);
  const dismiss = useCallback((id: number) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);
  const push = useCallback((request: ToastRequest) => {
    const id = ++sequence.current;
    const tone = request.tone ?? "info";
    const duration = request.duration ?? (tone === "danger" || tone === "error" ? errorDuration : defaultDuration);
    setToasts((current) => [...current, { ...request, id, tone, duration }]);
    return id;
  }, [defaultDuration, errorDuration]);
  const api = useMemo(() => ({ dismiss, push }), [dismiss, push]);
  return (
    <ToastContext.Provider value={api}>
      {children}
      <div aria-label={regionLabel} aria-live="polite" aria-atomic="false" className="ui-toast-region" role="region">
        {toasts.map((toast) => (
          <ToastItem
            key={toast.id}
            toast={toast}
            dismissLabel={dismissLabel}
            onDismiss={dismiss}
            icon={renderIcon?.(toast.tone ?? "info")}
          />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

function ToastItem({
  toast,
  dismissLabel,
  onDismiss,
  icon,
}: {
  readonly toast: ToastEntry;
  readonly dismissLabel: string;
  readonly onDismiss: (id: number) => void;
  readonly icon?: ReactNode;
}) {
  const [paused, setPaused] = useState(false);
  useEffect(() => {
    if (toast.duration <= 0 || paused) return;
    const timer = globalThis.setTimeout(() => onDismiss(toast.id), toast.duration);
    return () => globalThis.clearTimeout(timer);
  }, [onDismiss, paused, toast.duration, toast.id]);
  const tone = toast.tone ?? "info";
  return (
    <div
      aria-atomic="true"
      className="ui-toast"
      data-tone={tone}
      role={tone === "danger" || tone === "error" ? "alert" : "status"}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
    >
      {icon === undefined ? null : <span className="ui-toast__icon" aria-hidden="true">{icon}</span>}
      <div className="ui-toast__message">{toast.message}</div>
      {toast.action ? (
        <button className="ui-toast__action" type="button" onClick={() => {
          toast.action?.onClick();
          onDismiss(toast.id);
        }}>{toast.action.label}</button>
      ) : null}
      <button aria-label={dismissLabel} className="ui-toast__dismiss" onClick={() => onDismiss(toast.id)} type="button">
        <X />
      </button>
    </div>
  );
}
