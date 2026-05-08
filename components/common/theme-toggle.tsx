"use client";

import { Moon, Sun } from "lucide-react";
import { useSyncExternalStore } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "resume-score-theme";

type Theme = "light" | "dark";

function applyTheme(theme: Theme) {
  document.documentElement.classList.toggle("dark", theme === "dark");
  document.documentElement.style.colorScheme = theme;
  window.dispatchEvent(new Event("resume-score-theme-change"));
}

function subscribe(onStoreChange: () => void) {
  window.addEventListener("resume-score-theme-change", onStoreChange);
  queueMicrotask(onStoreChange);

  return () => {
    window.removeEventListener("resume-score-theme-change", onStoreChange);
  };
}

function getThemeSnapshot(): Theme {
  return document.documentElement.classList.contains("dark") ? "dark" : "light";
}

export function ThemeToggle() {
  const theme = useSyncExternalStore(subscribe, getThemeSnapshot, () => "dark");

  function toggleTheme() {
    const nextTheme = theme === "dark" ? "light" : "dark";

    applyTheme(nextTheme);
    window.localStorage.setItem(STORAGE_KEY, nextTheme);
  }

  const isDark = theme === "dark";

  return (
    <Button
      type="button"
      size="icon"
      variant="outline"
      aria-label={`Switch to ${isDark ? "light" : "dark"} theme`}
      onClick={toggleTheme}
      className="relative size-10 overflow-hidden border-white/20 bg-white/70 shadow-[0_0_28px_rgba(14,165,233,0.18)] backdrop-blur-xl hover:border-primary/45 hover:bg-white/90 dark:border-white/10 dark:bg-white/8 dark:hover:bg-white/12 cursor-pointer"
    >
      <span
        className={cn(
          "absolute inset-1 rounded-full bg-linear-to-br from-amber-300/25 via-sky-300/20 to-fuchsia-400/25 opacity-80 transition-transform duration-500",
          isDark ? "translate-x-3 scale-75" : "-translate-x-3 scale-90"
        )}
      />
      <Sun
        className={cn(
          "absolute size-4 text-amber-500 transition-all duration-300",
          isDark ? "rotate-90 scale-0 opacity-0" : "rotate-0 scale-100 opacity-100"
        )}
      />
      <Moon
        className={cn(
          "absolute size-4 text-sky-200 transition-all duration-300",
          isDark ? "rotate-0 scale-100 opacity-100" : "-rotate-90 scale-0 opacity-0"
        )}
      />
    </Button>
  );
}
