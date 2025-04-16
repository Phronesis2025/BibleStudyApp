import { BookOpenIcon, ArrowLeftIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

interface NavigationHeaderProps {
  currentPage: string;
  isAuthenticated: boolean;
  setIsSignupModalOpen?: (open: boolean) => void;
  setMode?: (mode: "signup" | "signin") => void;
  handleSignOut?: () => void;
}

export default function NavigationHeader({
  currentPage,
  isAuthenticated,
  setIsSignupModalOpen,
  setMode,
  handleSignOut,
}: NavigationHeaderProps) {
  const router = useRouter();
  const supabase = createClientComponentClient();

  const defaultHandleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

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
          {isAuthenticated ? (
            <>
              {currentPage === "profile" ? (
                <Link
                  href="/reading"
                  className="bg-sky-400/20 text-sky-400 px-2 sm:px-3 py-1 rounded-lg hover:bg-sky-400/30 transition font-['Poppins'] text-sm sm:text-base flex items-center"
                >
                  <ArrowLeftIcon className="h-4 w-4 mr-1" />
                  Back to Reading
                </Link>
              ) : (
                <Link
                  href="/profile"
                  className="bg-sky-400/20 text-sky-400 px-2 sm:px-3 py-1 rounded-lg hover:bg-sky-400/30 transition font-['Poppins'] text-sm sm:text-base"
                >
                  Profile
                </Link>
              )}
              <button
                onClick={handleSignOut || defaultHandleSignOut}
                className="border border-sky-400 text-sky-400 px-2 sm:px-3 py-1 rounded-lg hover:bg-sky-400/10 transition font-['Poppins'] text-sm sm:text-base"
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
                className="bg-sky-400/20 text-sky-400 px-2 sm:px-3 py-1 rounded-lg hover:bg-sky-400/30 transition font-['Poppins'] text-sm sm:text-base"
              >
                Sign Up
              </button>
              <button
                onClick={() => {
                  setIsSignupModalOpen?.(true);
                  setMode?.("signin");
                }}
                className="border border-sky-400 text-sky-400 px-2 sm:px-3 py-1 rounded-lg hover:bg-sky-400/10 transition font-['Poppins'] text-sm sm:text-base"
              >
                Sign In
              </button>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
