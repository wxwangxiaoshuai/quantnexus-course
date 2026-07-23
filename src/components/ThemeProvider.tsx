import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";

export type Theme = "light" | "dark";

interface ThemeContextValue {
  theme: Theme;
  hasUserChoice: boolean;
  setTheme: (t: Theme) => void;
  toggle: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);
const STORAGE_KEY = "qn-course-theme";

function readInitialTheme(): { theme: Theme; hasUserChoice: boolean } {
  if (typeof document === "undefined") {
    return { theme: "dark", hasUserChoice: false };
  }
  const isLight = document.documentElement.classList.contains("light");
  let hasUserChoice = false;
  try {
    hasUserChoice = localStorage.getItem(STORAGE_KEY) !== null;
  } catch {
    /* ignore */
  }
  return { theme: isLight ? "light" : "dark", hasUserChoice };
}

function applyTheme(theme: Theme) {
  document.documentElement.classList.toggle("light", theme === "light");
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const initial = readInitialTheme();
  const [theme, setThemeState] = useState<Theme>(initial.theme);
  const [hasUserChoice, setHasUserChoice] = useState(initial.hasUserChoice);

  const setTheme = useCallback((t: Theme) => {
    applyTheme(t);
    try {
      localStorage.setItem(STORAGE_KEY, t);
    } catch {
      /* ignore */
    }
    setThemeState(t);
    setHasUserChoice(true);
  }, []);

  const toggle = useCallback(() => {
    setTheme(theme === "light" ? "dark" : "light");
  }, [theme, setTheme]);

  useEffect(() => {
    if (hasUserChoice) return;
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mql = window.matchMedia("(prefers-color-scheme: light)");
    const onChange = (e: MediaQueryListEvent) => {
      const next: Theme = e.matches ? "light" : "dark";
      applyTheme(next);
      setThemeState(next);
    };
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, [hasUserChoice]);

  return (
    <ThemeContext.Provider value={{ theme, hasUserChoice, setTheme, toggle }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
