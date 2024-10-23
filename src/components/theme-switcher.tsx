"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

export function ThemeSwitcher() {
  const { setTheme, theme } = useTheme();

  return (
    <>
      <button
        className="bg-darkBg dark:bg-bg"
        onClick={() => setTheme(theme === "light" ? "dark" : "light")}
      >
        <Sun className="m500:h-4 m500:w-4 stroke-text hidden h-6 w-6 dark:inline" />
        <Moon className="m500:h-4 m500:w-4 stroke-darkText inline h-6 w-6 dark:hidden" />
        <span className="sr-only">Toggle theme</span>
      </button>
    </>
  );
}
