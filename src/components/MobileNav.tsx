import { Link } from "react-router-dom";
import { Bell, Menu, User } from "lucide-react";
import ThemeToggle from "./ThemeToggle";

interface MobileNavProps {
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  user?: any;
}

const MobileNav = ({ toggleSidebar }: MobileNavProps) => {
  return (
    <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 md:hidden">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <button
              onClick={toggleSidebar}
              className="p-2 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              aria-label="Open menu"
            >
              <Menu size={24} />
            </button>

            <Link to="/dashboard" className="ml-3">
              <span className="text-xl font-bold text-[#075E54] dark:text-green-400">
                🇬🇭 TalkGhana
              </span>
            </Link>
          </div>

          <div className="flex items-center space-x-3">
            <ThemeToggle />

            <button className="p-2 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 relative">
              <Bell size={20} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>

            <Link
              to="/profile"
              className="p-1 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
            >
              <User size={20} />
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};

export default MobileNav;
