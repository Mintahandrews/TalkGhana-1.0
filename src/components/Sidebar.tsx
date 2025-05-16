import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import ThemeToggle from "./ThemeToggle";
import {
  Bookmark,
  CircleHelp,
  House,
  LogOut,
  MessageSquare,
  Mic,
  Settings,
  Type,
  User,
} from "lucide-react";

const Sidebar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const navItems = [
    { name: "Dashboard", path: "/dashboard", icon: <House size={20} /> },
    { name: "Speech to Text", path: "/asr", icon: <Mic size={20} /> },
    { name: "Text to Speech", path: "/tts", icon: <Type size={20} /> },
    { name: "Phrase Bank", path: "/phrases", icon: <Bookmark size={20} /> },
    { name: "WhatsApp", path: "/whatsapp", icon: <MessageSquare size={20} /> },
    { name: "Settings", path: "/settings", icon: <Settings size={20} /> },
    { name: "Profile", path: "/profile", icon: <User size={20} /> },
    { name: "Help", path: "/help", icon: <CircleHelp size={20} /> },
  ];

  // Check if a nav item is active
  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="h-full w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
      {/* Logo */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <Link to="/dashboard" className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-red-500 to-yellow-500 flex items-center justify-center">
            <span>🇬🇭</span>
          </div>
          <span className="text-xl font-bold text-[#075E54] dark:text-green-400">
            TalkGhana
          </span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-1 px-2">
          {navItems.map((item) => (
            <li key={item.path}>
              <Link
                to={item.path}
                className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                  isActive(item.path)
                    ? "bg-green-50 dark:bg-green-900/30 text-[#075E54] dark:text-green-400 font-medium"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50"
                }`}
              >
                <span
                  className={
                    isActive(item.path)
                      ? "text-[#075E54] dark:text-green-400"
                      : ""
                  }
                >
                  {item.icon}
                </span>
                <span>{item.name}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* User section */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center mb-4">
          <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center mr-3">
            <User size={20} className="text-gray-500 dark:text-gray-400" />
          </div>
          <div>
            <div className="font-medium text-gray-900 dark:text-white">
              {user?.name}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400 truncate">
              {user?.email}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <ThemeToggle />

          <button
            onClick={logout}
            className="flex items-center space-x-1 text-gray-600 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400"
          >
            <LogOut size={18} />
            <span className="text-sm">Logout</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
