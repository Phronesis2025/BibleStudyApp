"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navigation() {
  const pathname = usePathname();

  return (
    <nav className="fixed top-0 left-0 right-0 bg-gray-900/95 backdrop-blur-md text-white z-50 shadow-md">
      <div className="max-w-6xl mx-auto px-4 py-3 flex justify-between">
        <Link
          href="/"
          className={`text-gray-300 hover:text-gray-100 ${
            pathname === "/" ? "border-b-2 border-blue-500" : ""
          }`}
        >
          Home
        </Link>
        <div className="flex gap-4">
          <Link
            href="/reading"
            className={`text-gray-300 hover:text-gray-100 ${
              pathname === "/reading" ? "border-b-2 border-blue-500" : ""
            }`}
          >
            Reading
          </Link>
          <Link
            href="/metrics"
            className={`text-gray-300 hover:text-gray-100 ${
              pathname === "/metrics" ? "border-b-2 border-blue-500" : ""
            }`}
          >
            Metrics
          </Link>
        </div>
      </div>
    </nav>
  );
}
