/* eslint-disable react-refresh/only-export-components -- context + hook pattern */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { ACCENTS, DEFAULT_ACCENT_ID } from "./accents";
import { DEFAULT_WALLPAPER_ID, WALLPAPERS } from "./wallpapers";

export type ColorScheme = "light" | "dark" | "system";
type ResolvedScheme = "light" | "dark";

type Appearance = {
  scheme: ColorScheme;
  accentId: string;
  wallpaperId: string;
};

const STORAGE_KEY = "plasma-appearance-v1";

const defaultAppearance: Appearance = {
  scheme: "dark",
  accentId: DEFAULT_ACCENT_ID,
  wallpaperId: DEFAULT_WALLPAPER_ID,
};

function loadAppearance(): Appearance {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultAppearance;
    const parsed = JSON.parse(raw) as Partial<Appearance>;
    return {
      scheme:
        parsed.scheme === "light" ||
        parsed.scheme === "dark" ||
        parsed.scheme === "system"
          ? parsed.scheme
          : defaultAppearance.scheme,
      accentId:
        typeof parsed.accentId === "string" &&
        ACCENTS.some((a) => a.id === parsed.accentId)
          ? parsed.accentId
          : defaultAppearance.accentId,
      wallpaperId:
        parsed.wallpaperId !== "breeze" &&
        parsed.wallpaperId !== "aurora" &&
        typeof parsed.wallpaperId === "string" &&
        WALLPAPERS.some((w) => w.id === parsed.wallpaperId)
          ? parsed.wallpaperId
          : defaultAppearance.wallpaperId,
    };
  } catch {
    return defaultAppearance;
  }
}

type ThemeContextValue = {
  scheme: ColorScheme;
  resolvedScheme: ResolvedScheme;
  accentId: string;
  wallpaperId: string;
  setScheme: (scheme: ColorScheme) => void;
  toggleScheme: () => void;
  setAccent: (id: string) => void;
  setWallpaper: (id: string) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

function systemPrefersDark(): ResolvedScheme {
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [appearance, setAppearance] = useState<Appearance>(loadAppearance);
  const [systemDark, setSystemDark] = useState<ResolvedScheme>(systemPrefersDark);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = (e: MediaQueryListEvent) => setSystemDark(e.matches ? "dark" : "light");
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  const resolvedScheme: ResolvedScheme =
    appearance.scheme === "system" ? systemDark : appearance.scheme;

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove("theme-light", "theme-dark");
    root.classList.add(`theme-${resolvedScheme}`);
  }, [resolvedScheme]);

  useEffect(() => {
    const accent =
      ACCENTS.find((a) => a.id === appearance.accentId) ?? ACCENTS[0];
    const root = document.documentElement;
    root.style.setProperty("--breeze-accent", accent.color);
    root.style.setProperty("--breeze-accent-strong", accent.strong);
  }, [appearance.accentId]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(appearance));
    } catch {
      // storage unavailable; settings stay session-only
    }
  }, [appearance]);

  const setScheme = useCallback((scheme: ColorScheme) => {
    setAppearance((prev) => ({ ...prev, scheme }));
  }, []);

  const toggleScheme = useCallback(() => {
    setAppearance((prev) => ({
      ...prev,
      scheme:
        prev.scheme === "system"
          ? systemPrefersDark() === "dark"
            ? "light"
            : "dark"
          : prev.scheme === "dark"
            ? "light"
            : "dark",
    }));
  }, []);

  const setAccent = useCallback((accentId: string) => {
    setAppearance((prev) => ({ ...prev, accentId }));
  }, []);

  const setWallpaper = useCallback((wallpaperId: string) => {
    setAppearance((prev) => ({ ...prev, wallpaperId }));
  }, []);

  const value = useMemo<ThemeContextValue>(
    () => ({
      scheme: appearance.scheme,
      resolvedScheme,
      accentId: appearance.accentId,
      wallpaperId: appearance.wallpaperId,
      setScheme,
      toggleScheme,
      setAccent,
      setWallpaper,
    }),
    [
      appearance,
      resolvedScheme,
      setScheme,
      toggleScheme,
      setAccent,
      setWallpaper,
    ],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
