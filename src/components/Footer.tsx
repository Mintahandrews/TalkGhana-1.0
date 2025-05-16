import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-gray-100 dark:bg-gray-800 py-8 shadow-inner dark:shadow-none border-t border-gray-200 dark:border-gray-700">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <Link
              to="/"
              className="text-xl font-bold text-[#075E54] dark:text-[#25D366] transition-colors duration-300"
            >
              TalkGhana
            </Link>
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
              Audio recording and transcription in Ghanaian languages
            </p>
          </div>
          <div className="flex flex-col md:flex-row md:space-x-8">
            <Link
              to="/"
              className="text-gray-600 dark:text-gray-300 hover:text-[#075E54] dark:hover:text-[#25D366] my-1 md:my-0 transition-colors duration-300"
            >
              Home
            </Link>
            <Link
              to="/about"
              className="text-gray-600 dark:text-gray-300 hover:text-[#075E54] dark:hover:text-[#25D366] my-1 md:my-0 transition-colors duration-300"
            >
              About
            </Link>
            <Link
              to="/privacy"
              className="text-gray-600 dark:text-gray-300 hover:text-[#075E54] dark:hover:text-[#25D366] my-1 md:my-0 transition-colors duration-300"
            >
              Privacy
            </Link>
            <Link
              to="/terms"
              className="text-gray-600 dark:text-gray-300 hover:text-[#075E54] dark:hover:text-[#25D366] my-1 md:my-0 transition-colors duration-300"
            >
              Terms
            </Link>
          </div>
        </div>
        <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700 text-center text-sm text-gray-600 dark:text-gray-400">
          © {new Date().getFullYear()} TalkGhana. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
