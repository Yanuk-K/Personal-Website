import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { APP_REGISTRY } from "../apps/registry";
import { PINNED_APPS } from "../apps/registry";
import { useTheme } from "../theme/ThemeProvider";
import { WALLPAPERS } from "../theme/wallpapers";
import { ContactsAppIcon, FileDocIcon, KonsoleIcon } from "../desktop/icons";

const DESKTOP_SHORTCUTS = [
  { label: "About Me.md", to: "/app/kate?doc=about", icon: <FileDocIcon size={28} /> },
  { label: "Resume", to: "/app/kate?doc=resume", icon: <FileDocIcon size={28} /> },
  { label: "Konsole", to: "/app/konsole", icon: <KonsoleIcon size={28} /> },
  { label: "Contacts", to: "/app/contacts", icon: <ContactsAppIcon size={28} /> },
];

export function MobileHome() {
  const { wallpaperId } = useTheme();
  const wallpaper = WALLPAPERS.find((w) => w.id === wallpaperId) ?? WALLPAPERS[0];
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 15_000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative flex h-[100dvh] flex-col overflow-hidden" style={{ background: wallpaper.css }}>
      {/* Status bar */}
      <div className="flex items-center justify-between px-5 pb-1 pt-3 text-white">
        <span className="text-[13px] font-semibold [text-shadow:0_1px_2px_rgba(0,0,0,0.6)]">
          {now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false })}
        </span>
        <span className="flex items-center gap-1.5 opacity-90">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
            <path d="M2.5 9.5a15 15 0 0 1 19 0M5.5 12.8a10.5 10.5 0 0 1 13 0M8.6 16a6 6 0 0 1 6.8 0" />
          </svg>
          <svg width="20" height="12" viewBox="0 0 26 14" fill="none" aria-hidden>
            <rect x="1" y="1.5" width="21" height="11" rx="2.5" stroke="white" />
            <rect x="3" y="3.5" width="14" height="7" rx="1" fill="white" />
            <path d="M23.8 5v4" stroke="white" strokeLinecap="round" strokeWidth="1.6" />
          </svg>
        </span>
      </div>

      {/* Clock */}
      <div className="px-6 pb-4 pt-10 text-white [text-shadow:0_1px_4px_rgba(0,0,0,0.55)]">
        <p className="text-[54px] font-light leading-none tracking-tight">
          {now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false })}
        </p>
        <p className="mt-1 text-[15px]">
          {now.toLocaleDateString([], { weekday: "long", month: "long", day: "numeric" })}
        </p>
      </div>

      <section className="mt-auto px-4" aria-labelledby="desktop-shortcuts">
        <div className="mb-2 flex items-center justify-between text-white [text-shadow:0_1px_3px_rgba(0,0,0,0.8)]">
          <h2 id="desktop-shortcuts" className="text-[12px] font-semibold">Desktop shortcuts</h2>
          <span className="text-[10px] text-white/75">Portfolio files and apps</span>
        </div>
        <nav className="flex gap-2 overflow-x-auto pb-3" aria-label="Desktop shortcuts">
          {DESKTOP_SHORTCUTS.map((shortcut) => (
            <Link key={shortcut.label} to={shortcut.to} className="flex w-[76px] shrink-0 flex-col items-center gap-1 rounded bg-black/30 px-1 py-2 active:scale-95">
              {shortcut.icon}
              <span className="w-full truncate text-center text-[10px] font-medium text-white [text-shadow:0_1px_3px_rgba(0,0,0,0.8)]">{shortcut.label}</span>
            </Link>
          ))}
        </nav>
      </section>

      <nav className="grid grid-cols-4 gap-y-5 px-4 pb-8" aria-label="Applications">
        {PINNED_APPS.map((id) => {
          const app = APP_REGISTRY[id];
          return (
            <Link
              key={id}
              to={`/app/${id}`}
              className="flex flex-col items-center gap-1.5 active:scale-95 transition-transform"
            >
              <app.icon size={52} />
              <span className="w-full truncate text-center text-[11px] font-medium text-white [text-shadow:0_1px_3px_rgba(0,0,0,0.8)]">
                {app.name}
              </span>
            </Link>
          );
        })}
      </nav>

      <p className="pb-3 text-center text-[10.5px] text-white/70">
        Yeunwook Kim · Kubuntu / Breeze Dark
      </p>
    </div>
  );
}
