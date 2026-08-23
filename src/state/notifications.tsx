/* eslint-disable react-refresh/only-export-components -- context + hook pattern */
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { CloseXIcon } from "../desktop/icons";

export type Toast = {
  id: number;
  title: string;
  body?: string;
  icon?: ReactNode;
  leaving?: boolean;
};

type NotificationsContextValue = {
  notify: (toast: { title: string; body?: string; icon?: ReactNode }) => void;
};

const NotificationsContext = createContext<NotificationsContextValue | null>(null);

let nextToastId = 1;

export function NotificationsProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const timers = useRef<Map<number, ReturnType<typeof setTimeout>>>(new Map());

  const dismiss = useCallback((id: number) => {
    setToasts((prev) =>
      prev.map((t) => (t.id === id ? { ...t, leaving: true } : t)),
    );
    const timer = setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
      timers.current.delete(id);
    }, 240);
    timers.current.set(id, timer);
  }, []);

  const notify = useCallback(
    ({ title, body, icon }: { title: string; body?: string; icon?: ReactNode }) => {
      const id = nextToastId++;
      setToasts((prev) => [...prev.slice(-3), { id, title, body, icon }]);
      const timer = setTimeout(() => dismiss(id), 4600);
      timers.current.set(id, timer);
    },
    [dismiss],
  );

  const value = useMemo(() => ({ notify }), [notify]);

  return (
    <NotificationsContext.Provider value={value}>
      {children}
      <div
        className="pointer-events-none fixed right-3 top-3 z-[9000] flex w-[340px] max-w-[calc(100vw-24px)] flex-col gap-2"
        role="status"
        aria-live="polite"
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 rounded-window border border-line bg-window p-3 text-text shadow-popup backdrop-blur-xl ${
              toast.leaving ? "anim-notification-out" : "anim-notification-in"
            }`}
          >
            {toast.icon ? (
              <div className="mt-0.5 shrink-0">{toast.icon}</div>
            ) : null}
            <div className="min-w-0 flex-1">
              <p className="text-[13px] font-semibold leading-tight text-text">
                {toast.title}
              </p>
              {toast.body ? (
                <p className="mt-1 text-[12.5px] leading-snug text-subtle">
                  {toast.body}
                </p>
              ) : null}
            </div>
            <button
              type="button"
              aria-label="Close notification"
              onClick={() => dismiss(toast.id)}
              className="rounded p-1 text-subtle hover:bg-hover hover:text-text"
            >
              <CloseXIcon size={13} />
            </button>
          </div>
        ))}
      </div>
    </NotificationsContext.Provider>
  );
}

export function useNotifications(): NotificationsContextValue {
  const ctx = useContext(NotificationsContext);
  if (!ctx)
    throw new Error("useNotifications must be used within NotificationsProvider");
  return ctx;
}
