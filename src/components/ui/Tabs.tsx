import * as React from "react";
import { motion } from "framer-motion";

type TabsProps = {
  defaultValue: string;
  value?: string;
  onValueChange?: (value: string) => void;
  className?: string;
  children: React.ReactNode;
};

type TabsListProps = {
  className?: string;
  children: React.ReactNode;
};

type TabsTriggerProps = {
  value: string;
  className?: string;
  children: React.ReactNode;
};

type TabsContentProps = {
  value: string;
  className?: string;
  children: React.ReactNode;
};

const TabsContext = React.createContext<{
  value: string;
  onValueChange: (value: string) => void;
} | null>(null);

function useTabs() {
  const context = React.useContext(TabsContext);
  if (!context) {
    throw new Error("Tabs components must be used within a Tabs component");
  }
  return context;
}

export function Tabs({
  defaultValue,
  value: controlledValue,
  onValueChange: controlledOnValueChange,
  className = "",
  children,
}: TabsProps) {
  const [uncontrolledValue, setUncontrolledValue] =
    React.useState(defaultValue);

  // Determine if component is controlled or uncontrolled
  const isControlled = controlledValue !== undefined;
  const value = isControlled ? controlledValue : uncontrolledValue;

  const handleValueChange = React.useCallback(
    (newValue: string) => {
      if (!isControlled) {
        setUncontrolledValue(newValue);
      }
      controlledOnValueChange?.(newValue);
    },
    [isControlled, controlledOnValueChange]
  );

  return (
    <TabsContext.Provider
      value={{
        value,
        onValueChange: handleValueChange,
      }}
    >
      <div className={className}>{children}</div>
    </TabsContext.Provider>
  );
}

export function TabsList({ className = "", children }: TabsListProps) {
  return (
    <div
      className={`inline-flex items-center justify-center rounded-md bg-gray-100 dark:bg-gray-800 p-1 ${className}`}
    >
      {children}
    </div>
  );
}

export function TabsTrigger({
  value,
  className = "",
  children,
}: TabsTriggerProps) {
  const { value: selectedValue, onValueChange } = useTabs();
  const isSelected = selectedValue === value;

  return (
    <button
      type="button"
      role="tab"
      aria-selected={isSelected}
      data-state={isSelected ? "active" : "inactive"}
      onClick={() => onValueChange(value)}
      className={`
        relative w-full px-3 py-1.5 text-sm font-medium 
        transition-all 
        ${
          isSelected
            ? "text-gray-900 dark:text-white"
            : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
        }
        ${className}
      `}
    >
      {children}
      {isSelected && (
        <motion.div
          layoutId="tab-indicator"
          className="absolute inset-0 bg-white dark:bg-gray-700 rounded-md shadow-sm z-0"
          transition={{ duration: 0.25 }}
          style={{ zIndex: -1 }}
        />
      )}
    </button>
  );
}

export function TabsContent({
  value,
  className = "",
  children,
}: TabsContentProps) {
  const { value: selectedValue } = useTabs();
  const isSelected = selectedValue === value;

  if (!isSelected) return null;

  return (
    <motion.div
      role="tabpanel"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      transition={{ duration: 0.15 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
