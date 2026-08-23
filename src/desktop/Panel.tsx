import { useEffect, useMemo, useRef, useState } from "react";
import { APP_REGISTRY, PINNED_APPS } from "../apps/registry";
import { useOpenApp } from "../lib/useOpenApp";
import { useClickOutside } from "../lib/useClickOutside";
import { useNotifications } from "../state/notifications";
import { useWindows } from "../state/windows";
import { BatteryIcon, BrightnessIcon, KickoffIcon, MoonIcon, PowerIcon, SearchIcon, VolumeIcon, WifiIcon } from "./icons";
import { useTheme } from "../theme/ThemeProvider";

export function Panel() {
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-[7000] h-14">
      <div className="pointer-events-auto flex h-full items-center gap-1 border-t border-line bg-panel-tint px-1.5 text-text shadow-panel backdrop-blur-xl">
        <Kickoff />
        <div className="mx-1 h-7 w-px bg-line/80" />
        <TaskManager />
        <div className="flex-1" />
        <div className="mx-1 h-7 w-px bg-line/80" />
        <SystemTray />
        <DigitalClock />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Kickoff                                                             */
/* ------------------------------------------------------------------ */

function Kickoff() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [section, setSection] = useState("Favorites");
  const ref = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const openApp = useOpenApp();
  const { notify } = useNotifications();

  useClickOutside(ref, open, () => setOpen(false));

  useEffect(() => {
    if (open) {
      setQuery("");
      setSection("Favorites");
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [open]);

  const pinned = PINNED_APPS.map((id) => APP_REGISTRY[id]);
  const sectionApps = section === "Computer"
    ? pinned.filter((app) => app.id === "dolphin" || app.id === "settings")
    : section === "History"
      ? []
      : pinned;
  const results = sectionApps.filter((app) =>
    `${app.name} ${app.genericName}`.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <div className="relative" ref={ref}>
      <PanelButton
        label="Application Launcher"
        active={open}
        onClick={() => setOpen((v) => !v)}
      >
        <KickoffIcon size={34} />
      </PanelButton>

      {open && (
        <div
          role="menu"
          aria-label="Application Launcher"
          className="solid-popup-surface anim-popup-in absolute bottom-[64px] left-0 flex h-[480px] w-[540px] max-w-[calc(100vw-16px)] overflow-hidden rounded-window border border-line text-text shadow-popup"
        >
          <aside className="flex w-[156px] shrink-0 flex-col border-r border-line bg-chrome/50 p-2">
            <div className="mb-3 flex items-center gap-2 px-2 py-1">
              <div aria-hidden className="flex h-7 w-7 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-accent-fg">YK</div>
              <span className="truncate text-[12px] font-medium">Yeunwook Kim</span>
            </div>
            {["Favorites", "All Applications", "Computer", "History"].map((item) => (
              <button key={item} type="button" onClick={() => setSection(item)} className={`rounded px-2.5 py-1.5 text-left text-[12.5px] ${section === item ? "bg-accent text-accent-fg" : "hover:bg-hover"}`}>
                {item}
              </button>
            ))}
            <div className="flex-1" />
            <button
              type="button"
              onClick={() => {
                notify({ title: "Leaving so soon?", body: "Restarting the session…" });
                setTimeout(() => window.location.reload(), 900);
              }}
              className="flex items-center gap-2 rounded px-2.5 py-1.5 text-[12.5px] text-subtle hover:bg-hover hover:text-text"
              title="Restart session"
            >
              <PowerIcon size={16} /> Leave
            </button>
          </aside>
          <div className="flex min-w-0 flex-1 flex-col p-3">
            <p className="mb-2 text-[13px] font-medium">{query ? "Search results" : section}</p>
            <div className="grid min-h-0 flex-1 grid-cols-2 content-start gap-1 overflow-y-auto pr-1">
              {results.map((app) => (
                <button key={app.id} type="button" onClick={() => { openApp(app.id); setOpen(false); }} className="flex items-center gap-3 rounded px-2 py-2 text-left hover:bg-hover focus-visible:bg-hover focus-visible:outline-none">
                  <app.icon size={34} />
                  <span className="min-w-0"><span className="block truncate text-[12.5px]">{app.name}</span><span className="block truncate text-[11px] text-subtle">{app.genericName}</span></span>
                </button>
              ))}
              {results.length === 0 && <p className="col-span-2 py-6 text-center text-[12.5px] text-subtle">No applications found.</p>}
            </div>
            <label className="mt-2 flex items-center gap-2 border-t border-line pt-3 text-subtle">
              <SearchIcon size={16} />
              <input ref={inputRef} value={query} onChange={(e) => setQuery(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && results.length > 0) { openApp(results[0].id); setOpen(false); } if (e.key === "Escape") setOpen(false); }} placeholder="Search..." aria-label="Search applications" className="min-w-0 flex-1 bg-transparent text-[13px] text-text outline-none placeholder:text-subtle" />
            </label>
          </div>
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Task Manager                                                        */
/* ------------------------------------------------------------------ */

function TaskManager() {
  const { windows, activeId, toggleMinimize, restoreWindow } = useWindows();
  const openApp = useOpenApp();

  const runningIds = useMemo(
    () => Array.from(new Set(windows.map((w) => w.appId))),
    [windows],
  );

  const buttons = [
    ...PINNED_APPS,
    ...runningIds.filter((id) => !PINNED_APPS.includes(id)),
  ];

  const handleClick = (appId: (typeof buttons)[number]) => {
    const appWindows = windows.filter((w) => w.appId === appId);
    if (appWindows.length === 0) {
      openApp(appId);
      return;
    }
    const top = appWindows.reduce((a, b) => (a.z > b.z ? a : b));
    if (!top.minimized && activeId === top.id) toggleMinimize(top.id);
    else restoreWindow(top.id);
  };

  return (
    <div className="flex items-center gap-0.5">
      {buttons.map((appId) => {
        const meta = APP_REGISTRY[appId];
        const running = runningIds.includes(appId);
        const focused = windows.some((w) => w.appId === appId && w.id === activeId && !w.minimized);
        return (
          <div key={appId} className="group relative">
            <button
              type="button"
              onClick={() => handleClick(appId)}
              aria-label={`${meta.name}${running ? " (running)" : ""}`}
              className={`relative flex h-10 w-10 items-center justify-center rounded transition-colors ${
                focused ? "bg-hover" : "hover:bg-hover"
              }`}
            >
              <meta.icon size={32} />
              {running && (
                <span
                  aria-hidden
                  className={`absolute bottom-0 left-1/2 h-[3px] -translate-x-1/2 transition-all ${
                    focused ? "w-4 bg-accent" : "w-2 bg-subtle"
                  }`}
                />
              )}
            </button>
            <Tooltip>{meta.name}</Tooltip>
          </div>
        );
      })}
    </div>
  );
}

function Tooltip({ children }: { children: string }) {
  return (
    <span
      role="tooltip"
      className="pointer-events-none absolute bottom-[56px] left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-md border border-line/60 bg-chrome px-2 py-1 text-[11.5px] font-medium text-text opacity-0 shadow-popup transition-opacity delay-200 group-hover:opacity-100"
    >
      {children}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* System Tray                                                         */
/* ------------------------------------------------------------------ */

function SystemTray() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useClickOutside(ref, open, () => setOpen(false));

  return (
    <div className="relative" ref={ref}>
      <div className="flex h-11 items-center gap-2.5 rounded-lg px-2.5 text-subtle hover:bg-hover">
        <button type="button" aria-label="Network" className="text-current" onClick={() => setOpen((v) => !v)}>
          <WifiIcon size={16} />
        </button>
        <button type="button" aria-label="Volume" className="text-current" onClick={() => setOpen((v) => !v)}>
          <VolumeIcon size={16} />
        </button>
        <button type="button" aria-label="Battery 82 percent" className="text-current" onClick={() => setOpen((v) => !v)}>
          <BatteryIcon size={17} level={0.82} />
        </button>
      </div>

      {open && <TrayPopup />}
    </div>
  );
}

function TrayPopup() {
  const { resolvedScheme, toggleScheme } = useTheme();
  const [volume, setVolume] = useState(64);
  const [brightness, setBrightness] = useState(100);
  const [wifi, setWifi] = useState(true);

  useEffect(() => {
    document.documentElement.style.setProperty(
      "--screen-dim",
      String(((100 - brightness) / 100) * 0.55),
    );
  }, [brightness]);

  return (
    <div className="solid-popup-surface anim-popup-in absolute bottom-[64px] right-0 w-[280px] rounded-window border border-line p-4 text-text shadow-popup">
      <div className="flex items-center justify-between">
        <p className="text-[13px] font-semibold">System Tray</p>
        <span className="rounded-full bg-hover px-2 py-0.5 text-[11px] text-subtle">
          Battery 82% · 4:12 remaining
        </span>
      </div>

      <TraySlider
        icon={<VolumeIcon size={15} />}
        label={`Volume ${volume}%`}
        value={volume}
        onChange={(e) => setVolume(Number(e.target.value))}
      />
      <TraySlider
        icon={<BrightnessIcon size={15} />}
        label={`Brightness ${brightness}%`}
        value={brightness}
        min={35}
        onChange={(e) => setBrightness(Number(e.target.value))}
      />

      <div className="mt-2 space-y-1">
        <TrayRow
          icon={<WifiIcon size={15} />}
          label={wifi ? "Connected · eduroam" : "Disconnected"}
          control={
            <ToggleSwitch checked={wifi} onChange={() => setWifi((v) => !v)} label="Wi-Fi" />
          }
        />
        <TrayRow
          icon={<MoonIcon size={15} />}
          label={resolvedScheme === "dark" ? "Dark theme" : "Light theme"}
          control={
            <ToggleSwitch
              checked={resolvedScheme === "dark"}
              onChange={toggleScheme}
              label="Dark mode"
            />
          }
        />
      </div>
    </div>
  );
}

function TraySlider({
  icon,
  label,
  ...props
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  min?: number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <div className="mt-3">
      <div className="mb-1 flex items-center gap-2 text-subtle">
        {icon}
        <span className="text-[12px]">{label}</span>
      </div>
      <input type="range" className="breeze-range" {...props} aria-label={label} style={{ ["--range-fill" as string]: `${props.value}%` }} />
    </div>
  );
}

function TrayRow({
  icon,
  label,
  control,
}: {
  icon: React.ReactNode;
  label: string;
  control: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-2 rounded-md px-1 py-1.5 hover:bg-hover">
      <span className="text-subtle">{icon}</span>
      <span className="min-w-0 flex-1 truncate text-[12.5px]">{label}</span>
      {control}
    </div>
  );
}

export function ToggleSwitch({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={onChange}
      className={`relative h-[20px] w-[36px] shrink-0 rounded-full transition-colors ${
        checked ? "bg-accent" : "bg-line"
      }`}
    >
      <span
        className={`absolute top-[2px] h-4 w-4 rounded-full bg-white shadow transition-transform ${
          checked ? "translate-x-[18px]" : "translate-x-[2px]"
        }`}
      />
    </button>
  );
}

/* ------------------------------------------------------------------ */
/* Digital clock + calendar                                            */
/* ------------------------------------------------------------------ */

function DigitalClock() {
  const [now, setNow] = useState(() => new Date());
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useClickOutside(ref, open, () => setOpen(false));

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 10_000);
    return () => clearInterval(timer);
  }, []);

  const time = now
    .toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false })
    .replace(/^24/, "00");
  const date = now.toLocaleDateString([], { month: "short", day: "numeric" });

  return (
    <div className="relative" ref={ref}>
      <PanelButton label="Calendar and clock" active={open} onClick={() => setOpen((v) => !v)}>
        <span className="flex items-center gap-2 leading-none">
          <span className="font-mono text-[12px] font-semibold tabular-nums">{time}</span>
          <span className="text-[10.5px] text-subtle">{date}</span>
        </span>
      </PanelButton>
      {open && <CalendarPopup today={now} />}
    </div>
  );
}

function CalendarPopup({ today }: { today: Date }) {
  const [view, setView] = useState({
    year: today.getFullYear(),
    month: today.getMonth(),
  });

  const firstDay = new Date(view.year, view.month, 1).getDay();
  const daysInMonth = new Date(view.year, view.month + 1, 0).getDate();
  const cells: (number | null)[] = [
    ...Array.from({ length: firstDay }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  const monthLabel = new Date(view.year, view.month, 1).toLocaleDateString([], {
    month: "long",
    year: "numeric",
  });

  const shift = (delta: number) =>
    setView(({ year, month }) => {
      const next = new Date(year, month + delta, 1);
      return { year: next.getFullYear(), month: next.getMonth() };
    });

  return (
    <div className="anim-popup-in absolute bottom-[64px] right-0 w-[272px] rounded-window border border-line bg-window p-4 text-text shadow-popup backdrop-blur-xl">
      <div className="mb-2 flex items-center justify-between">
        <p className="text-[13px] font-semibold">{monthLabel}</p>
        <div className="flex gap-1">
          <button type="button" aria-label="Previous month" onClick={() => shift(-1)} className="rounded p-1 hover:bg-hover">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="m14.5 5.5-6.5 6.5 6.5 6.5"/></svg>
          </button>
          <button type="button" aria-label="Next month" onClick={() => shift(1)} className="rounded p-1 hover:bg-hover">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="m9.5 5.5 6.5 6.5-6.5 6.5"/></svg>
          </button>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-y-1 text-center text-[11px] font-medium text-subtle">
        {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
          <span key={d}>{d}</span>
        ))}
      </div>
      <div className="mt-1 grid grid-cols-7 gap-y-0.5 text-center text-[12px]">
        {cells.map((day, i) => {
          const isToday =
            day === today.getDate() &&
            view.month === today.getMonth() &&
            view.year === today.getFullYear();
          return (
            <span
              key={i}
              className={`mx-auto flex h-7 w-7 items-center justify-center rounded-full ${
                day == null ? "" : isToday ? "bg-accent font-bold text-accent-fg" : "hover:bg-hover"
              }`}
            >
              {day ?? ""}
            </span>
          );
        })}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */

function PanelButton({
  label,
  active,
  onClick,
  children,
}: {
  label: string;
  active?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className={`flex h-10 min-w-[42px] items-center justify-center rounded px-2 transition-colors ${
        active ? "bg-hover" : "hover:bg-hover"
      }`}
    >
      {children}
    </button>
  );
}
