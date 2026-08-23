import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from "react";
import {
  CloseXIcon,
  MaximizeSquareIcon,
  MinimizeDashIcon,
  RestoreSquaresIcon,
} from "./icons";
import { APP_REGISTRY } from "../apps/registry";
import { PANEL_ZONE, useWindows, type Rect, type WinState } from "../state/windows";

const MIN_W = 320;
const MIN_H = 200;

type DragState =
  | { mode: "move"; startX: number; startY: number; origin: Rect }
  | { mode: "resize"; dir: string; startX: number; startY: number; origin: Rect };

export function BreezeWindow({
  win,
  active,
  minW = MIN_W,
  minH = MIN_H,
  children,
}: {
  win: WinState;
  active: boolean;
  minW?: number;
  minH?: number;
  children: ReactNode;
}) {
  const { focusWindow, closeWindow, toggleMaximize, toggleMinimize, setRect } =
    useWindows();
  const [closing, setClosing] = useState(false);
  const [interacting, setInteracting] = useState(false);
  const dragRef = useRef<DragState | null>(null);

  const beginDrag = useCallback(
    (e: ReactPointerEvent, mode: "move" | "resize", dir = "") => {
      if (win.maximized && mode === "move") return;
      e.preventDefault();
      focusWindow(win.id);
      dragRef.current = {
        mode,
        dir,
        startX: e.clientX,
        startY: e.clientY,
        origin: { x: win.x, y: win.y, w: win.w, h: win.h },
      };
      setInteracting(true);
      (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    },
    [focusWindow, win],
  );

  useEffect(() => {
    if (!interacting) return;

    const onMove = (e: PointerEvent) => {
      const drag = dragRef.current;
      if (!drag) return;
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const maxBottom = vh - PANEL_ZONE;

      if (drag.mode === "move") {
        const nx = clamp(
          drag.origin.x + e.clientX - drag.startX,
          -(drag.origin.w - 110),
          vw - 110,
        );
        const ny = clamp(
          drag.origin.y + e.clientY - drag.startY,
          0,
          maxBottom - 44,
        );
        setRect(win.id, { ...drag.origin, x: nx, y: ny });
        return;
      }

      const d = drag.dir;
      let { x, y, w, h } = drag.origin;
      const dx = e.clientX - drag.startX;
      const dy = e.clientY - drag.startY;

      if (d.includes("e")) w = Math.max(minW, drag.origin.w + dx);
      if (d.includes("s")) h = Math.max(minH, drag.origin.h + dy);
      if (d.includes("w")) {
        const nw = Math.max(minW, drag.origin.w - dx);
        x = drag.origin.x + (drag.origin.w - nw);
        w = nw;
      }
      if (d.includes("n")) {
        const nh = Math.max(minH, drag.origin.h - dy);
        y = Math.max(0, drag.origin.y + (drag.origin.h - nh));
        h = drag.origin.y + drag.origin.h - y;
      }
      if (y + h > maxBottom) h = maxBottom - y;
      setRect(win.id, { x, y, w, h });
    };

    const onUp = () => {
      dragRef.current = null;
      setInteracting(false);
    };

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
    };
  }, [interacting, minW, minH, setRect, win.id]);

  const requestClose = () => {
    setClosing(true);
    window.setTimeout(() => closeWindow(win.id), 125);
  };

  const geometry = win.maximized
    ? { left: 6, top: 6, width: "calc(100vw - 12px)", height: `calc(100vh - ${PANEL_ZONE + 6}px)` }
    : { left: win.x, top: win.y, width: win.w, height: win.h };

  const resizeDirs = ["n", "s", "e", "w", "ne", "nw", "se", "sw"];
  const AppIcon = APP_REGISTRY[win.appId].icon;

  return (
    <section
      role="dialog"
      aria-label={win.title}
      aria-hidden={win.minimized || undefined}
      className={`absolute flex flex-col overflow-hidden border border-line bg-window backdrop-blur-xl ${
        win.maximized ? "" : "rounded-window"
      } select-none ${
        active ? "shadow-window" : "shadow-window-unfocused"
      } ${
        closing ? "anim-window-close pointer-events-none" : "anim-window-open"
      } ${
        win.minimized
          ? "pointer-events-none translate-y-[24vh] scale-90 opacity-0"
          : ""
      } transition-[opacity,transform] duration-150`}
      style={{
        ...geometry,
        zIndex: win.z,
        transitionProperty: interacting ? "none" : undefined,
        animationFillMode: closing ? "forwards" : undefined,
      }}
      onPointerDownCapture={() => {
        if (!active && !closing) focusWindow(win.id);
      }}
    >
      {/* Title bar */}
      <header
        className="relative flex h-8 shrink-0 items-center justify-center border-b border-line bg-chrome px-2"
        onDoubleClick={() => toggleMaximize(win.id)}
        onPointerDown={(e) => {
          if ((e.target as HTMLElement).closest("[data-winbtn]")) return;
          beginDrag(e, "move");
        }}
        >
          <span className="absolute left-2 flex h-5 w-5 items-center justify-center">
          <AppIcon size={18} />
          </span>
        <span
          className={`max-w-[70%] truncate text-[12px] font-medium ${
            active ? "text-text" : "text-subtle"
          }`}
        >
          {win.title}
        </span>
        <div className="absolute right-0 flex h-full items-center" data-winbtn>
          <TitleButton label="Minimize" onClick={() => toggleMinimize(win.id)}>
            <MinimizeDashIcon size={13} />
          </TitleButton>
          <TitleButton label={win.maximized ? "Restore" : "Maximize"} onClick={() => toggleMaximize(win.id)}>
            {win.maximized ? <RestoreSquaresIcon size={13} /> : <MaximizeSquareIcon size={13} />}
          </TitleButton>
          <TitleButton label="Close" danger onClick={requestClose}>
            <CloseXIcon size={13} />
          </TitleButton>
        </div>
      </header>

      {/* Content */}
      <div className="breeze-scroll relative min-h-0 flex-1 overflow-hidden bg-view text-text">
        {children}
      </div>

      {/* Resize handles */}
      {!win.maximized &&
        resizeDirs.map((dir) => (
          <div
            key={dir}
            onPointerDown={(e) => beginDrag(e, "resize", dir)}
            className={RESIZE_STYLES[dir]}
          />
        ))}
    </section>
  );
}

function TitleButton({
  label,
  danger,
  onClick,
  children,
}: {
  label: string;
  danger?: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className={`flex h-8 w-8 items-center justify-center text-text/85 transition-colors hover:bg-hover ${
        danger ? "hover:!bg-negative hover:!text-white" : ""
      }`}
    >
      {children}
    </button>
  );
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

const RESIZE_STYLES: Record<string, string> = {
  n: "absolute inset-x-3 -top-0.5 h-2 cursor-n-resize",
  s: "absolute inset-x-3 -bottom-0.5 h-2 cursor-s-resize",
  e: "absolute -right-0.5 inset-y-3 w-2 cursor-e-resize",
  w: "absolute -left-0.5 inset-y-3 w-2 cursor-w-resize",
  ne: "absolute -right-0.5 -top-0.5 h-3.5 w-3.5 cursor-ne-resize",
  nw: "absolute -left-0.5 -top-0.5 h-3.5 w-3.5 cursor-nw-resize",
  se: "absolute -right-0.5 -bottom-0.5 h-3.5 w-3.5 cursor-se-resize",
  sw: "absolute -left-0.5 -bottom-0.5 h-3.5 w-3.5 cursor-sw-resize",
};
