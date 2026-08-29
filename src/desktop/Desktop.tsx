import { useEffect, useState } from "react";
import { useWindows, type WinState } from "../state/windows";
import { useTheme } from "../theme/ThemeProvider";
import { WALLPAPERS } from "../theme/wallpapers";
import { useNotifications } from "../state/notifications";
import { useOpenApp } from "../lib/useOpenApp";
import { BreezeWindow } from "./Window";
import { Panel } from "./Panel";
import { KRunner } from "./KRunner";
import { AppContent } from "../apps/AppContent";
import { APP_REGISTRY } from "../apps/registry";
import {
  ContactsAppIcon,
  FileDocIcon,
  KonsoleIcon,
} from "./icons";
import { isAppId, type DocId } from "../state/fs";

export function Desktop({
  initialApp,
  openAboutInitially = false,
}: {
  initialApp?: string;
  openAboutInitially?: boolean;
}) {
  const { windows } = useWindows();
  const theme = useTheme();
  const openApp = useOpenApp();
  const { notify } = useNotifications();
  const [runnerOpen, setRunnerOpen] = useState(false);
  const [selectedIcon, setSelectedIcon] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      notify({
        title: "Welcome to Yeunwook's portfolio",
        body: "Kubuntu-style Plasma desktop · Press Meta (or Ctrl+Space) to search.",
      });
    }, 900);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (isAppId(initialApp)) {
      openApp(initialApp);
    } else if (openAboutInitially) {
      openApp("kate", {
        payload: { docId: "about" },
        title: "About Me.md — Kate",
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const onOpenApp = (e: Event) => {
      const appId = (e as CustomEvent<string>).detail;
      if (isAppId(appId)) openApp(appId);
    };
    window.addEventListener("plasma-open-app", onOpenApp);
    return () => window.removeEventListener("plasma-open-app", onOpenApp);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.key === "Meta" && !e.repeat) || (e.ctrlKey && e.code === "Space")) {
        setRunnerOpen((v) => !v);
      }
      if (e.key === "Escape") setRunnerOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const wallpaper =
    WALLPAPERS.find((w) => w.id === theme.wallpaperId) ?? WALLPAPERS[0];

  const openDoc = (docId: DocId, name: string) =>
    openApp("kate", { payload: { docId }, title: `${name} — Kate` });

  return (
    <div className="fixed inset-0 overflow-hidden">
      {/* Wallpaper */}
      <div aria-hidden className="absolute inset-0" style={{ background: wallpaper.css }} />

      {/* Desktop icons */}
      <div
        className="absolute left-3 top-3 z-0 flex flex-col gap-1"
        onPointerDown={() => setSelectedIcon(null)}
      >
        <DesktopIcon
          label="About Me.md"
          selected={selectedIcon === "about"}
          onSelect={() => setSelectedIcon("about")}
          onOpen={() => openDoc("about", "About Me.md")}
          icon={<FileDocIcon size={34} className="text-white drop-shadow" />}
        />
        <DesktopIcon
          label="Resume"
          selected={selectedIcon === "resume"}
          onSelect={() => setSelectedIcon("resume")}
          onOpen={() => openDoc("resume", "Resume")}
          icon={<FileDocIcon size={34} className="text-white drop-shadow" />}
        />
        <DesktopIcon
          label="Konsole"
          selected={selectedIcon === "konsole"}
          onSelect={() => setSelectedIcon("konsole")}
          onOpen={() => openApp("konsole")}
          icon={<KonsoleIcon size={34} />}
        />
        <DesktopIcon
          label="Contacts"
          selected={selectedIcon === "contacts"}
          onSelect={() => setSelectedIcon("contacts")}
          onOpen={() => openApp("contacts")}
          icon={<ContactsAppIcon size={34} />}
        />
      </div>

      {/* Windows layer */}
      <div className="pointer-events-none absolute inset-0 z-10">
        {windows.map((win) => (
          <WindowFrame key={win.id} win={win}>
            <AppContent win={win} />
          </WindowFrame>
        ))}
      </div>

      {/* Brightness dim overlay */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-[9500] bg-black transition-opacity"
        style={{ opacity: "var(--screen-dim, 0)" }}
      />

      <KRunner open={runnerOpen} onClose={() => setRunnerOpen(false)} />
      <Panel />
    </div>
  );
}

function WindowFrame({ win, children }: { win: WinState; children: React.ReactNode }) {
  const { activeId } = useWindows();
  return (
    <div className="pointer-events-auto">
      <BreezeWindow
        win={win}
        active={activeId === win.id}
        minW={minSizeFor(win).w}
        minH={minSizeFor(win).h}
      >
        {children}
      </BreezeWindow>
    </div>
  );
}

function minSizeFor(win: WinState): { w: number; h: number } {
  const app = APP_REGISTRY[win.appId];
  return { w: app.minW, h: app.minH };
}

function DesktopIcon({
  label,
  icon,
  selected,
  onSelect,
  onOpen,
}: {
  label: string;
  icon: React.ReactNode;
  selected: boolean;
  onSelect: () => void;
  onOpen: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      onDoubleClick={onOpen}
      onKeyDown={(e) => {
        if (e.key === "Enter") onOpen();
      }}
      className={`flex w-[86px] flex-col items-center gap-1 rounded-md px-1 py-2 text-white ${
        selected ? "bg-accent/40 outline outline-1 outline-accent" : "hover:bg-white/10"
      }`}
    >
      {icon}
      <span className="max-w-full rounded bg-black/45 px-1.5 py-0.5 text-center text-[11.5px] font-medium [text-shadow:0_1px_3px_rgba(0,0,0,0.8)]">
        {label}
      </span>
    </button>
  );
}
