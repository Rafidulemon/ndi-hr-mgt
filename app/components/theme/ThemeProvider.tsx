'use client';

import {
  createContext,
  startTransition,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type Theme = "light" | "dark";

type ThemeContextValue = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
};

const STORAGE_KEY = "ndi-hr-theme";

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

type ThemeProviderProps = {
  children: ReactNode;
};

type ThemeState = {
  theme: Theme;
  hasStoredPreference: boolean;
};

const applyThemeToRoot = (nextTheme: Theme) => {
  if (typeof document === "undefined") return;
  const rootElement = document.documentElement;
  rootElement.classList.toggle("dark", nextTheme === "dark");
  rootElement.setAttribute("data-theme", nextTheme);
};

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [state, setState] = useState<ThemeState>({
    theme: "light",
    hasStoredPreference: false,
  });
  const { theme, hasStoredPreference } = state;

  useEffect(() => {
    applyThemeToRoot(theme);
  }, [theme]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const storedTheme = window.localStorage.getItem(STORAGE_KEY) as
      | Theme
      | null;

    if (storedTheme === "light" || storedTheme === "dark") {
      startTransition(() => {
        setState((previous) => {
          if (
            previous.theme === storedTheme &&
            previous.hasStoredPreference === true
          ) {
            return previous;
          }
          return { theme: storedTheme, hasStoredPreference: true };
        });
      });
      return;
    }

    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    startTransition(() => {
      setState((previous) => {
        const nextTheme = prefersDark ? "dark" : "light";
        if (
          previous.theme === nextTheme &&
          previous.hasStoredPreference === false
        ) {
          return previous;
        }
        return { theme: nextTheme, hasStoredPreference: false };
      });
    });
  }, []);

  useEffect(() => {
    if (typeof window === "undefined" || hasStoredPreference) return;
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = (event: MediaQueryListEvent) => {
      setState((previous) => ({
        ...previous,
        theme: event.matches ? "dark" : "light",
      }));
    };

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener("change", handleChange);
    } else {
      mediaQuery.addListener(handleChange);
    }

    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener("change", handleChange);
      } else {
        mediaQuery.removeListener(handleChange);
      }
    };
  }, [hasStoredPreference]);

  const setExplicitTheme = useCallback((next: Theme) => {
    setState(() => {
      if (typeof window !== "undefined") {
        window.localStorage.setItem(STORAGE_KEY, next);
      }
      return { theme: next, hasStoredPreference: true };
    });
  }, []);

  const toggleTheme = useCallback(() => {
    setState((previous) => {
      const next = previous.theme === "dark" ? "light" : "dark";
      if (typeof window !== "undefined") {
        window.localStorage.setItem(STORAGE_KEY, next);
      }
      return { theme: next, hasStoredPreference: true };
    });
  }, []);

  const value = useMemo<ThemeContextValue>(
    () => ({
      theme,
      setTheme: setExplicitTheme,
      toggleTheme,
    }),
    [theme, setExplicitTheme, toggleTheme]
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
