import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

// Theme types
type ThemeMode = "light" | "dark";
type ContrastMode = "normal" | "high";

interface ThemeContextType {
  theme: ThemeMode;
  contrast: ContrastMode;
  toggleTheme: () => void;
  toggleContrast: () => void;
  setTheme: (theme: ThemeMode) => void;
  setContrast: (contrast: ContrastMode) => void;
  isDark: boolean;
  isHighContrast: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  // Initialize theme from localStorage or system preference
  const [theme, setThemeState] = useState<ThemeMode>(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark" || savedTheme === "light") return savedTheme;
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  });

  // Initialize contrast mode from localStorage
  const [contrast, setContrastState] = useState<ContrastMode>(() => {
    const savedContrast = localStorage.getItem("contrast");
    return savedContrast === "high" ? "high" : "normal";
  });

  // Set theme with localStorage update
  const setTheme = (newTheme: ThemeMode) => {
    setThemeState(newTheme);
    localStorage.setItem("theme", newTheme);
  };

  // Set contrast with localStorage update
  const setContrast = (newContrast: ContrastMode) => {
    setContrastState(newContrast);
    localStorage.setItem("contrast", newContrast);
  };

  // Update theme class on document
  useEffect(() => {
    const root = window.document.documentElement;

    // Remove old classes
    root.classList.remove("light", "dark", "contrast-normal", "contrast-high");

    // Add new classes
    root.classList.add(theme);
    root.classList.add(`contrast-${contrast}`);
  }, [theme, contrast]);

  // Listen for system preference changes
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const handleChange = (e: MediaQueryListEvent) => {
      // Only change theme if user hasn't explicitly set a preference
      if (!localStorage.getItem("theme")) {
        setThemeState(e.matches ? "dark" : "light");
      }
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  // Toggle theme
  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
  };

  // Toggle contrast
  const toggleContrast = () => {
    const newContrast = contrast === "high" ? "normal" : "high";
    setContrast(newContrast);
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        contrast,
        toggleTheme,
        toggleContrast,
        setTheme,
        setContrast,
        isDark: theme === "dark",
        isHighContrast: contrast === "high",
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

// Custom hook to use theme context
export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
