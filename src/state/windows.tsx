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
import type { AppId } from "./fs";
import type { DocId } from "./fs";
import { APP_REGISTRY } from "../apps/registry";

/** Vertical space reserved for the floating panel + breathing room. */
export const PANEL_ZONE = 68;

export type WindowPayload = {
  docId?: DocId;
  projectId?: string;
  /** Dolphin: folder path relative to home */
  path?: string[];
};

export type Rect = { x: number; y: number; w: number; h: number };

export type WinState = {
  id: string;
  appId: AppId;
  payload?: WindowPayload;
  title: string;
} & Rect & {
    z: number;
    minimized: boolean;
    maximized: boolean;
    prevRect?: Rect;
  };

type OpenOptions = {
  appId: AppId;
  title: string;
  w: number;
  h: number;
  payload?: WindowPayload;
};

type WindowsContextValue = {
  windows: WinState[];
  activeId: string | null;
  openApp: (opts: OpenOptions) => void;
  focusWindow: (id: string) => void;
  closeWindow: (id: string) => void;
  toggleMinimize: (id: string) => void;
  restoreWindow: (id: string) => void;
  toggleMaximize: (id: string) => void;
  setRect: (id: string, rect: Rect) => void;
  setTitle: (id: string, title: string) => void;
  findByApp: (
    appId: AppId,
    match?: (payload: WindowPayload | undefined) => boolean,
  ) => WinState | undefined;
};

const WindowsContext = createContext<WindowsContextValue | null>(null);

let nextWindowId = 1;

function viewportSize() {
  return {
    vw: typeof window === "undefined" ? 1280 : window.innerWidth,
    vh: typeof window === "undefined" ? 800 : window.innerHeight,
  };
}

export function WindowsProvider({ children }: { children: ReactNode }) {
  const [windows, setWindows] = useState<WinState[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const topZ = useRef(10);
  const cascade = useRef(0);

  const focusWindow = useCallback((id: string) => {
    setActiveId(id);
    setWindows((prev) => {
      const target = prev.find((w) => w.id === id);
      if (!target || target.z === topZ.current) return prev;
      const z = ++topZ.current;
      return prev.map((w) => (w.id === id ? { ...w, z } : w));
    });
  }, []);

  const openApp = useCallback(
    ({ appId, title, w, h, payload }: OpenOptions) => {
      let createdId: string | null = null;
      setWindows((prev) => {
        // Focus existing identical app+payload instead of duplicating.
        const existing = prev.find((win) =>
          win.appId !== appId
            ? false
            : APP_REGISTRY[appId].singleInstance ||
              JSON.stringify(win.payload ?? null) === JSON.stringify(payload ?? null),
        );
        if (existing) {
          createdId = existing.id;
          const z = ++topZ.current;
          return prev.map((win) =>
            win.id === existing.id
              ? { ...win, z, minimized: false, payload, title }
              : win,
          );
        }

        const { vw, vh } = viewportSize();
        const width = Math.min(w, vw - 48);
        const height = Math.min(h, vh - PANEL_ZONE - 24);
        const step = (cascade.current++ % 6) * 30;
        const x = Math.max(12, Math.round((vw - width) / 2 - 70 + step));
        const y = Math.max(12, Math.round((vh - PANEL_ZONE - height) / 2 - 30 + step));
        const z = ++topZ.current;
        const id = `win-${nextWindowId++}`;
        createdId = id;
        return [
          ...prev,
          {
            id,
            appId,
            payload,
            title,
            x,
            y,
            w: width,
            h: height,
            z,
            minimized: false,
            maximized: false,
          },
        ];
      });
      if (createdId) setActiveId(createdId);
    },
    [],
  );

  const closeWindow = useCallback((id: string) => {
    setWindows((prev) => prev.filter((w) => w.id !== id));
    setActiveId((current) => (current === id ? null : current));
  }, []);

  const restoreWindow = useCallback(
    (id: string) => {
      setWindows((prev) =>
        prev.map((w) => (w.id === id ? { ...w, minimized: false } : w)),
      );
      focusWindow(id);
    },
    [focusWindow],
  );

  const toggleMinimize = useCallback(
    (id: string) => {
      setWindows((prev) => {
        const target = prev.find((w) => w.id === id);
        if (!target) return prev;
        if (!target.minimized && activeId === id) {
          return prev.map((w) => (w.id === id ? { ...w, minimized: true } : w));
        }
        return prev.map((w) => (w.id === id ? { ...w, minimized: false } : w));
      });
      const target = windows.find((w) => w.id === id);
      if (target && (target.minimized || activeId !== id)) focusWindow(id);
      else setActiveId(null);
    },
    [windows, activeId, focusWindow],
  );

  const toggleMaximize = useCallback((id: string) => {
    setWindows((prev) =>
      prev.map((w) => {
        if (w.id !== id) return w;
        if (w.maximized) {
          const r = w.prevRect ?? { x: 80, y: 60, w: 720, h: 480 };
          return { ...w, maximized: false, ...r, prevRect: undefined };
        }
        return { ...w, maximized: true, prevRect: { x: w.x, y: w.y, w: w.w, h: w.h } };
      }),
    );
    focusWindow(id);
  }, [focusWindow]);

  const setRect = useCallback((id: string, rect: Rect) => {
    setWindows((prev) =>
      prev.map((w) => (w.id === id && !w.maximized ? { ...w, ...rect } : w)),
    );
  }, []);

  const setTitle = useCallback((id: string, title: string) => {
    setWindows((prev) =>
      prev.map((w) => (w.id === id ? { ...w, title } : w)),
    );
  }, []);

  const findByApp = useCallback(
    (appId: AppId, match?: (payload: WindowPayload | undefined) => boolean) =>
      windows.find(
        (w) => w.appId === appId && (!match || match(w.payload)),
      ),
    [windows],
  );

  const value = useMemo<WindowsContextValue>(
    () => ({
      windows,
      activeId,
      openApp,
      focusWindow,
      closeWindow,
      toggleMinimize,
      restoreWindow,
      toggleMaximize,
      setRect,
      setTitle,
      findByApp,
    }),
    [
      windows,
      activeId,
      openApp,
      focusWindow,
      closeWindow,
      toggleMinimize,
      restoreWindow,
      toggleMaximize,
      setRect,
      setTitle,
      findByApp,
    ],
  );

  return (
    <WindowsContext.Provider value={value}>{children}</WindowsContext.Provider>
  );
}

export function useWindows(): WindowsContextValue {
  const ctx = useContext(WindowsContext);
  if (!ctx) throw new Error("useWindows must be used within WindowsProvider");
  return ctx;
}
