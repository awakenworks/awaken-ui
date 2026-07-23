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
import {
  AlertDialog,
  type AlertDialogImpact,
} from "./alert-dialog.js";

export interface ConfirmRequest {
  readonly title: ReactNode;
  readonly description?: ReactNode;
  readonly impacts?: readonly AlertDialogImpact[];
  readonly confirmLabel: string;
  readonly cancelLabel: string;
  readonly danger?: boolean;
}

export type Confirm = (request: ConfirmRequest) => Promise<boolean>;

interface PendingConfirm {
  readonly id: number;
  readonly request: ConfirmRequest;
  readonly resolve: (confirmed: boolean) => void;
}

const ConfirmContext = createContext<Confirm | null>(null);

export function useConfirm(): Confirm {
  const confirm = useContext(ConfirmContext);
  if (!confirm) {
    throw new Error("useConfirm must be used within ConfirmProvider");
  }
  return confirm;
}

/**
 * Serializes confirmations so concurrent callers cannot replace or orphan an
 * unresolved request. Unmounting settles every pending request as cancelled.
 */
export function ConfirmProvider({ children }: { readonly children: ReactNode }) {
  const sequence = useRef(0);
  const queueRef = useRef<PendingConfirm[]>([]);
  const [active, setActive] = useState<PendingConfirm | null>(null);
  const activeRef = useRef<PendingConfirm | null>(null);
  activeRef.current = active;

  const showNext = useCallback(() => {
    setActive((current) => current ?? queueRef.current.shift() ?? null);
  }, []);

  const confirm = useCallback<Confirm>(
    (request) =>
      new Promise<boolean>((resolve) => {
        queueRef.current.push({
          id: ++sequence.current,
          request,
          resolve,
        });
        showNext();
      }),
    [showNext],
  );

  const settle = useCallback(
    (confirmed: boolean) => {
      setActive((current) => {
        current?.resolve(confirmed);
        return null;
      });
      queueMicrotask(showNext);
    },
    [showNext],
  );

  useEffect(
    () => () => {
      activeRef.current?.resolve(false);
      for (const pending of queueRef.current.splice(0)) pending.resolve(false);
    },
    [],
  );

  const value = useMemo(() => confirm, [confirm]);
  return (
    <ConfirmContext.Provider value={value}>
      {children}
      {active ? (
        <AlertDialog
          {...active.request}
          onConfirm={() => settle(true)}
          onOpenChange={(open) => {
            if (!open) settle(false);
          }}
          open
        />
      ) : null}
    </ConfirmContext.Provider>
  );
}
