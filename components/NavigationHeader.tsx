"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function NavigationHeader() {
  const [isClient, setIsClient] = useState(false);
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const userId = searchParams.get("userId");

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return (
      <nav className="bg-gray-900 shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <Link
                  href="/"
                  className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
                >
                  Home
                </Link>
              </div>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="bg-gray-900 shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link
                href="/"
                className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
              >
                Home
              </Link>
            </div>
            {userId && (
              <>
                <Link
                  href={`/reading?userId=${userId}`}
                  className={`${
                    pathname === "/reading"
                      ? "text-blue-400"
                      : "text-gray-300 hover:text-white"
                  } px-3 py-2 rounded-md text-sm font-medium`}
                >
                  Reading
                </Link>
                <Link
                  href={`/metrics?userId=${userId}`}
                  className={`${
                    pathname === "/metrics"
                      ? "text-blue-400"
                      : "text-gray-300 hover:text-white"
                  } px-3 py-2 rounded-md text-sm font-medium`}
                >
                  Metrics
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
