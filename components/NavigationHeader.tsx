"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function NavigationHeader() {
  const [isClient, setIsClient] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    setIsClient(true);

    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
      }
    };

    getUser();
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
                  href="/reading"
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
