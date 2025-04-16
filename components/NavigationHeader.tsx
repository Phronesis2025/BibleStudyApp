"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import type { Session } from "@supabase/supabase-js";
import { ArrowLeftIcon } from "@heroicons/react/24/solid";

type NavigationHeaderProps = {
  setIsSignupModalOpen?: (open: boolean) => void;
  setMode?: (mode: "signup" | "signin") => void;
  currentPage?: string;
  isAuthenticated?: boolean;
};

export default function NavigationHeader({
  setIsSignupModalOpen,
  setMode,
  currentPage,
  isAuthenticated,
}: NavigationHeaderProps) {
  const router = useRouter();
  const supabase = createClientComponentClient();
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    const checkSession = async () => {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();
      if (error) {
        console.error("Error checking session in NavigationHeader:", error);
      }
      setSession(session);
    };

    checkSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  // Use explicit isAuthenticated prop if provided, otherwise fallback to session check
  const isUserAuthenticated =
    isAuthenticated !== undefined ? isAuthenticated : !!session;

  return (
    <header className="bg-gray-900/50 backdrop-blur-md border-b border-sky-500/20 fixed top-0 left-0 right-0 z-20">
      <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14 sm:h-16">
          <div className="flex items-center">
            <svg
              className="h-5 w-5 sm:h-8 sm:w-8 text-sky-400 mr-1 sm:mr-3 transition-transform hover:scale-105"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5s3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18s-3.332.477-4.5 1.253"
              />
            </svg>
            <span className="text-base sm:text-xl font-bold text-gray-50 font-['Poppins'] tracking-tight">
              Bible Study App
            </span>
          </div>
          <div className="flex items-center gap-1 sm:gap-3">
            {isUserAuthenticated ? (
              <>
                {currentPage === "profile" ? (
                  <Link
                    href="/reading"
                    className="bg-gradient-to-r from-sky-400 to-blue-500 text-white hover:from-sky-500 hover:to-blue-600 px-1.5 py-0.5 sm:px-3 sm:py-2 rounded-md text-xs sm:text-sm font-medium font-['Poppins'] focus:outline-sky-400 flex items-center"
                  >
                    <ArrowLeftIcon className="h-4 w-4 mr-1 sm:mr-2" />
                    Back to Reading
                  </Link>
                ) : (
                  <Link
                    href="/profile"
                    className="bg-gradient-to-r from-sky-400 to-blue-500 text-white hover:from-sky-500 hover:to-blue-600 px-1.5 py-0.5 sm:px-3 sm:py-2 rounded-md text-xs sm:text-sm font-medium font-['Poppins'] focus:outline-sky-400"
                  >
                    Profile
                  </Link>
                )}
                <button
                  onClick={handleSignOut}
                  className="border border-sky-400 text-sky-400 hover:bg-sky-400/10 px-1.5 py-0.5 sm:px-3 sm:py-2 rounded-md text-xs sm:text-sm font-medium font-['Poppins'] focus:outline-sky-400"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => {
                    setIsSignupModalOpen?.(true);
                    setMode?.("signup");
                  }}
                  className="bg-gradient-to-r from-sky-400 to-blue-500 text-white hover:from-sky-500 hover:to-blue-600 px-1.5 py-0.5 sm:px-3 sm:py-2 rounded-md text-xs sm:text-sm font-medium font-['Poppins'] focus:outline-sky-400"
                >
                  Sign Up
                </button>
                <button
                  onClick={() => {
                    setIsSignupModalOpen?.(true);
                    setMode?.("signin");
                  }}
                  className="border border-sky-400 text-sky-400 hover:bg-sky-400/10 px-1.5 py-0.5 sm:px-3 sm:py-2 rounded-md text-xs sm:text-sm font-medium font-['Poppins'] focus:outline-sky-400"
                >
                  Sign In
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
