"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  HomeIcon,
  BookOpenIcon,
  ChartBarIcon,
} from "@heroicons/react/24/outline";

export default function NavigationHeader() {
  const searchParams = useSearchParams();
  const userId = searchParams.get("userId");

  return (
    <header className="bg-white dark:bg-gray-800 shadow-md">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex space-x-8">
            <Link
              href="/"
              className="flex items-center px-3 py-2 text-gray-700 dark:text-gray-200 hover:text-blue-500 dark:hover:text-blue-400"
            >
              <HomeIcon className="h-6 w-6 mr-2" />
              <span className="font-medium">Home</span>
            </Link>

            {userId && (
              <>
                <Link
                  href={`/reading?userId=${userId}`}
                  className="flex items-center px-3 py-2 text-gray-700 dark:text-gray-200 hover:text-blue-500 dark:hover:text-blue-400"
                >
                  <BookOpenIcon className="h-6 w-6 mr-2" />
                  <span className="font-medium">Reading</span>
                </Link>

                <Link
                  href={`/metrics?userId=${userId}`}
                  className="flex items-center px-3 py-2 text-gray-700 dark:text-gray-200 hover:text-blue-500 dark:hover:text-blue-400"
                >
                  <ChartBarIcon className="h-6 w-6 mr-2" />
                  <span className="font-medium">Metrics</span>
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
}
