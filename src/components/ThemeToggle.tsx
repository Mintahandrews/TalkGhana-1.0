import { Moon, Sun, Zap } from "lucide-react";
import { useTheme } from "../contexts/ThemeContext";
import { motion } from "framer-motion";

const ThemeToggle = () => {
  const { isDark, toggleTheme, isHighContrast, toggleContrast } = useTheme();

  return (
    <div className="flex items-center space-x-2">
      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={toggleTheme}
        className={`p-2 rounded-full transition-colors ${
          isDark
            ? "bg-gray-700 hover:bg-gray-600"
            : "bg-gray-200 hover:bg-gray-300"
        }`}
        aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
        title={isDark ? "Switch to light mode" : "Switch to dark mode"}
      >
        {isDark ? (
          <Sun size={20} className="text-ghana-yellow" />
        ) : (
          <Moon size={20} className="text-slate-700" />
        )}
      </motion.button>

      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={toggleContrast}
        className={`p-2 rounded-full transition-colors ${
          isHighContrast
            ? "bg-ghana-yellow bg-opacity-20 dark:bg-ghana-yellow dark:bg-opacity-20"
            : isDark
            ? "bg-gray-700 hover:bg-gray-600"
            : "bg-gray-200 hover:bg-gray-300"
        }`}
        aria-label={
          isHighContrast
            ? "Switch to normal contrast"
            : "Switch to high contrast"
        }
        title={
          isHighContrast
            ? "Switch to normal contrast"
            : "Switch to high contrast"
        }
      >
        <Zap
          size={20}
          className={
            isHighContrast
              ? "text-ghana-yellow dark:text-white"
              : "text-gray-500 dark:text-gray-400"
          }
        />
      </motion.button>
    </div>
  );
};

export default ThemeToggle;
