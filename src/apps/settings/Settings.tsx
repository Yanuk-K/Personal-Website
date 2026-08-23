import { useState } from "react";
import { useTheme } from "../../theme/ThemeProvider";
import { ACCENTS } from "../../theme/accents";
import { WALLPAPERS } from "../../theme/wallpapers";
import { useNotifications } from "../../state/notifications";
import { CheckIcon } from "./icons";
import { KickoffIcon } from "../../desktop/icons";

/* Sidebar glyphs */
const HalfMoonGlyph = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden>
    <path d="M20 14.5A8.5 8.5 0 0 1 9.5 4 8.5 8.5 0 1 0 20 14.5Z" />
    <path d="M16.8 4.2v3M15.3 5.7h3" />
  </svg>
);
const WallpaperGlyph = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <rect x="3.5" y="4.5" width="17" height="15" rx="2.5" />
    <circle cx="9" cy="10" r="1.8" />
    <path d="m5 17.5 4.5-4 3.5 3 3-2.5 3 2.5" />
  </svg>
);
const InfoGlyph = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M12 11v5M12 7.8v.4" />
  </svg>
);

type Page = "appearance" | "wallpaper" | "about";

const PAGES: { id: Page; label: string; sub: string; icon: React.ReactNode }[] = [
  {
    id: "appearance",
    label: "Appearance",
    sub: "Global theme & accent color",
    icon: <HalfMoonGlyph />,
  },
  {
    id: "wallpaper",
    label: "Wallpaper",
    sub: "Choose your backdrop",
    icon: <WallpaperGlyph />,
  },
  {
    id: "about",
    label: "About This System",
    sub: "Device information",
    icon: <InfoGlyph />,
  },
];

export function Settings() {
  const [page, setPage] = useState<Page>("appearance");
  const { notify } = useNotifications();

  return (
    <div className="flex h-full">
      {/* Sidebar */}
      <aside className="breeze-scroll w-[220px] shrink-0 overflow-y-auto border-r border-line bg-chrome/50 p-2">
        <p className="px-2 pb-2 pt-1 text-[15px] font-bold">System Settings</p>
        {PAGES.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => setPage(p.id)}
            className={`mb-1 flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left ${
              page === p.id ? "bg-accent/15 outline outline-1 outline-accent" : "hover:bg-hover"
            }`}
          >
            <span
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
                page === p.id ? "bg-accent text-accent-fg" : "bg-hover text-subtle"
              }`}
            >
              {p.icon}
            </span>
            <span className="min-w-0">
              <span className="block truncate text-[13px] font-semibold">{p.label}</span>
              <span className="block truncate text-[11px] text-subtle">{p.sub}</span>
            </span>
          </button>
        ))}
      </aside>

      {/* Content */}
      <div className="breeze-scroll min-w-0 flex-1 overflow-y-auto">
        {page === "appearance" && (
          <AppearancePage notify={notify} />
        )}
        {page === "wallpaper" && (
          <WallpaperPage notify={notify} />
        )}
        {page === "about" && <AboutPage />}
      </div>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border-b border-line px-6 py-5 last:border-b-0">
      <h2 className="mb-3 text-[13px] font-bold uppercase tracking-wide text-subtle">
        {title}
      </h2>
      {children}
    </section>
  );
}

function AppearancePage({
  notify,
}: {
  notify: (t: { title: string; body?: string }) => void;
}) {
  const { scheme, setScheme, accentId, setAccent } = useTheme();

  return (
    <>
      <Section title="Global Theme">
        <div className="grid max-w-[460px] grid-cols-2 gap-4">
          <ThemeCard
            label="Breeze Light"
            selected={scheme === "light"}
            onClick={() => {
              setScheme("light");
              notify({ title: "Appearance changed", body: "Switched to Breeze Light." });
            }}
          >
            <div className="flex h-full w-full flex-col bg-[#eff0f1] p-2">
              <div className="h-2.5 rounded-sm bg-[#fcfcfc] shadow-sm" />
              <div className="mt-1.5 flex flex-1 gap-1.5">
                <div className="w-8 rounded-sm bg-[#e6e7e8]" />
                <div className="flex-1 space-y-1">
                  <div className="h-2 w-4/5 rounded-sm bg-[#d7d8da]" />
                  <div className="h-2 w-3/5 rounded-sm bg-[#d7d8da]" />
                  <div className="mt-1 h-2.5 w-10 rounded-sm" style={{ background: "var(--breeze-accent)" }} />
                </div>
              </div>
            </div>
          </ThemeCard>
          <ThemeCard
            label="Breeze Dark"
            selected={scheme === "dark"}
            onClick={() => {
              setScheme("dark");
              notify({ title: "Appearance changed", body: "Switched to Breeze Dark." });
            }}
          >
            <div className="flex h-full w-full flex-col bg-[#232629] p-2">
              <div className="h-2.5 rounded-sm bg-[#2a2e32] shadow-sm" />
              <div className="mt-1.5 flex flex-1 gap-1.5">
                <div className="w-8 rounded-sm bg-[#31363b]" />
                <div className="flex-1 space-y-1">
                  <div className="h-2 w-4/5 rounded-sm bg-[#4a4f54]" />
                  <div className="h-2 w-3/5 rounded-sm bg-[#4a4f54]" />
                  <div className="mt-1 h-2.5 w-10 rounded-sm" style={{ background: "var(--breeze-accent)" }} />
                </div>
              </div>
            </div>
          </ThemeCard>
        </div>
        <p className="mt-3 text-[12px] text-subtle">
          “System” follows your device preference — this site defaults to dark, just like my setup.
        </p>
        <div className="mt-2 flex gap-2">
          <PillButton active={scheme === "system"} onClick={() => setScheme("system")}>
            Follow system
          </PillButton>
        </div>
      </Section>

      <Section title="Accent Color">
        <div className="flex flex-wrap items-center gap-3">
          {ACCENTS.map((accent) => (
            <button
              key={accent.id}
              type="button"
              title={accent.name}
              aria-label={`Accent color ${accent.name}`}
              onClick={() => {
                setAccent(accent.id);
                notify({ title: "Accent color changed", body: accent.name });
              }}
              className={`relative flex h-11 w-11 items-center justify-center rounded-full transition-transform hover:scale-105 ${
                accentId === accent.id ? "ring-2 ring-text ring-offset-2 ring-offset-view" : ""
              }`}
              style={{ background: accent.color }}
            >
              {accentId === accent.id && <CheckIcon size={18} className="text-white drop-shadow" />}
            </button>
          ))}
        </div>
        <p className="mt-3 text-[12px] text-subtle">
          The accent is applied instantly across the panel, windows and apps.
        </p>
      </Section>
    </>
  );
}

function WallpaperPage({
  notify,
}: {
  notify: (t: { title: string; body?: string }) => void;
}) {
  const { wallpaperId, setWallpaper } = useTheme();

  return (
    <Section title="Wallpaper">
      <div className="grid grid-cols-2 gap-4 xl:grid-cols-3">
        {WALLPAPERS.map((wp) => (
          <button
            key={wp.id}
            type="button"
            onClick={() => {
              setWallpaper(wp.id);
              notify({ title: "Wallpaper changed", body: wp.name });
            }}
            className={`group relative aspect-video overflow-hidden rounded-lg border-2 transition-shadow hover:shadow-popup ${
              wallpaperId === wp.id ? "border-accent shadow-popup" : "border-line"
            }`}
          >
            <span aria-hidden className="absolute inset-0" style={{ background: wp.css }} />
            <span className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-black/45 px-2.5 py-1.5 text-[12px] font-medium text-white backdrop-blur-sm">
              {wp.name}
              {wallpaperId === wp.id && <CheckIcon size={14} />}
            </span>
          </button>
        ))}
      </div>
    </Section>
  );
}

function AboutPage() {
  const rows: [string, string][] = [
    ["Operating System", "Kubuntu 26.04 LTS (Resolute Raccoon)"],
    ["KDE Plasma", "6.6.6"],
    ["Window Manager", "KWin (Wayland)"],
    ["Window Theme", "Breeze"],
    ["Application Theme", "Breeze (LeafDark)"],
    ["Icons", "Papirus-Dark"],
    ["Font", "Noto Sans 10pt"],
    ["Website", "Vite · React · Tailwind"],
  ];

  return (
    <Section title="System Information">
      <div className="mb-5 flex items-center gap-5">
        <KickoffIcon size={72} />
        <div>
          <p className="text-[17px] font-bold">Yeunwook Kim</p>
          <p className="text-[12.5px] text-subtle">Personal website of Yeunwook Kim</p>
        </div>
      </div>
      <dl className="max-w-[520px] divide-y divide-line overflow-hidden rounded-lg border border-line">
        {rows.map(([label, value]) => (
          <div key={label} className="grid grid-cols-[180px_1fr] gap-2 px-3.5 py-2 text-[12.5px] odd:bg-chrome/40">
            <dt className="font-semibold">{label}</dt>
            <dd className="truncate text-subtle">{value}</dd>
          </div>
        ))}
      </dl>
    </Section>
  );
}

function ThemeCard({
  label,
  selected,
  onClick,
  children,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button type="button" onClick={onClick} className="text-left">
      <span
        className={`block h-[92px] overflow-hidden rounded-lg border-2 ${
          selected ? "border-accent shadow-popup" : "border-line hover:border-subtle"
        }`}
      >
        {children}
      </span>
      <span className={`mt-1.5 block text-[12.5px] ${selected ? "font-bold" : ""}`}>
        {selected ? "● " : "○ "}
        {label}
      </span>
    </button>
  );
}

function PillButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-3 py-1 text-[12px] font-medium transition-colors ${
        active
          ? "border-transparent bg-accent text-accent-fg"
          : "border-line hover:bg-hover"
      }`}
    >
      {children}
    </button>
  );
}
