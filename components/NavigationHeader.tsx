import { BookOpenIcon, ArrowLeftIcon } from "@heroicons/react/24/outline";
import Link from "next/link";

interface NavigationHeaderProps {
  currentPage: string;
  isAuthenticated: boolean;
}

export default function NavigationHeader({
  currentPage,
  isAuthenticated,
}: NavigationHeaderProps) {
  return (
    <header className="fixed top-0 left-0 right-0 bg-gradient-to-r from-gray-800 to-blue-900 text-gray-200 shadow-md z-50">
      <nav className="max-w-6xl mx-auto px-2 sm:px-4 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center">
          <BookOpenIcon className="h-6 w-6 text-sky-400 mr-2" />
          <span className="text-lg font-semibold font-['Poppins']">
            Bible Study App
          </span>
        </Link>
        <div className="flex items-center space-x-2 sm:space-x-4">
          {isAuthenticated && currentPage === "profile" && (
            <Link
              href="/reading"
              className="bg-sky-400/20 text-sky-400 px-2 sm:px-3 py-1 rounded-lg hover:bg-sky-400/30 transition font-['Poppins'] text-sm sm:text-base flex items-center"
            >
              <ArrowLeftIcon className="h-4 w-4 mr-1" />
              Back to Reading
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
}
