"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

type NavigationHeaderProps = {
  isAuthenticated: boolean;
  setIsSignupModalOpen?: (open: boolean) => void;
  setMode?: (mode: "signup" | "signin") => void;
};

export default function NavigationHeader({
  isAuthenticated,
  setIsSignupModalOpen,
  setMode,
}: NavigationHeaderProps) {
  const router = useRouter();
  const supabase = createClientComponentClient();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  return (
    <nav className="fixed top-0 w-full z-50 bg-gray-900 shadow">
      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
        <div className="flex justify-end h-14 sm:h-16">
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <Link
                  href="/profile"
                  className="bg-gradient-to-r from-sky-400 to-blue-500 text-white hover:from-sky-500 hover:to-blue-600 px-3 py-2 rounded-md text-sm font-medium font-['Poppins'] focus:outline-sky-400"
                >
                  Profile
                </Link>
                <button
                  onClick={handleSignOut}
                  className="border border-sky-400 text-sky-400 hover:bg-sky-400/10 px-3 py-2 rounded-md text-sm font-medium font-['Poppins'] focus:outline-sky-400"
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
                  className="bg-gradient-to-r from-sky-400 to-blue-500 text-white hover:from-sky-500 hover:to-blue-600 px-3 py-2 rounded-md text-sm font-medium font-['Poppins'] focus:outline-sky-400"
                >
                  Sign Up
                </button>
                <button
                  onClick={() => {
                    setIsSignupModalOpen?.(true);
                    setMode?.("signin");
                  }}
                  className="border border-sky-400 text-sky-400 hover:bg-sky-400/10 px-3 py-2 rounded-md text-sm font-medium font-['Poppins'] focus:outline-sky-400"
                >
                  Sign In
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
