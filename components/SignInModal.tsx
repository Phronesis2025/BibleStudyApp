// components/SignInModal.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

type SignInModalProps = {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: "signup" | "signin";
};

export default function SignInModal({
  isOpen,
  onClose,
  initialMode = "signup",
}: SignInModalProps) {
  const router = useRouter();
  const [mode, setMode] = useState<"signup" | "signin">(initialMode);
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [isClient, setIsClient] = useState<boolean>(false);
  const {
    signUp,
    signIn,
    signInWithGoogle,
    forgotPassword,
    error,
    success,
    loading,
  } = useAuth();

  // Set isClient to true once the component mounts
  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return;
    }

    if (mode === "signup") {
      if (password !== confirmPassword) {
        return;
      }
      if (password.length < 8) {
        return;
      }
      await signUp(email, password);
    } else {
      await signIn(email, password);
    }

    if (success) {
      router.push("/reading");
      onClose();
    }
  };

  const handleForgotPassword = async () => {
    // Add console.log statements to debug the forgotten password functionality
    console.log("Forgot password clicked for email:", email);

    if (!email) {
      console.log("No email provided for password reset");
      forgotPassword(""); // This will trigger an error in the AuthContext
      return;
    }
    console.log("Attempting to reset password for:", email);
    await forgotPassword(email);
    console.log("Password reset request completed");
  };

  // Return null during server-side rendering or if modal is closed
  if (!isClient || !isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50">
      <div className="bg-gray-800/90 backdrop-blur-md border-2 border-sky-400/50 rounded-lg p-3 w-full max-w-sm md:max-w-md max-h-[80vh] overflow-y-auto relative shadow-lg">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900/70 z-10 backdrop-blur-sm">
            <svg
              className="animate-spin h-8 w-8 text-sky-400"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
          </div>
        )}
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-400 hover:text-gray-200"
        >
          <svg
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
        <div className="flex flex-col items-center mb-2">
          <svg
            className="h-6 w-6 text-blue-600 mb-1"
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
          <h2 className="text-xl font-bold text-gray-50 mb-4 sm:mb-6 font-['Poppins']">
            Bible Study App
          </h2>
          <p className="text-gray-300 mt-1 text-sm font-['Poppins']">
            {mode === "signup" ? "Create an account" : "Welcome back"}
          </p>
        </div>
        <div className="flex justify-center gap-2 mb-3">
          <button
            onClick={() => setMode("signup")}
            className={`px-2 py-0.5 rounded-lg text-sm font-['Poppins'] ${
              mode === "signup"
                ? "bg-gradient-to-r from-sky-400 to-blue-500 text-white"
                : "bg-gray-700 text-gray-300"
            }`}
          >
            Sign Up
          </button>
          <button
            onClick={() => setMode("signin")}
            className={`px-2 py-0.5 rounded-lg text-sm font-['Poppins'] ${
              mode === "signin"
                ? "bg-gradient-to-r from-sky-400 to-blue-500 text-white"
                : "bg-gray-700 text-gray-300"
            }`}
          >
            Sign In
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-2">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-200 font-['Poppins'] mb-1"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 bg-gray-200 border border-gray-300 rounded-lg text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-sky-400 text-sm font-['Poppins']"
              placeholder="Email"
              required
              autoComplete="email"
            />
          </div>
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-200 font-['Poppins'] mb-1"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 bg-gray-200 border border-gray-300 rounded-lg text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-sky-400 text-sm font-['Poppins']"
              placeholder="Password"
              required
              autoComplete={
                mode === "signin" ? "current-password" : "new-password"
              }
            />
          </div>
          {mode === "signup" && (
            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-gray-200 font-['Poppins'] mb-1"
              >
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-3 py-2 bg-gray-200 border border-gray-300 rounded-lg text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-sky-400 text-sm font-['Poppins']"
                placeholder="Confirm Password"
                required
                autoComplete="new-password"
              />
            </div>
          )}
          {mode === "signin" && (
            <div className="text-right">
              <button
                type="button"
                onClick={handleForgotPassword}
                className="text-sm text-sky-400 hover:underline font-['Poppins']"
              >
                Forgot password?
              </button>
            </div>
          )}
          {error && (
            <p className="text-red-500 text-sm font-['Poppins']">{error}</p>
          )}
          {success && (
            <p className="text-green-500 text-sm font-['Poppins']">{success}</p>
          )}
          <div className="flex gap-2">
            <button
              type="submit"
              className="flex-1 px-2 py-0.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-['Poppins'] disabled:opacity-50"
              disabled={loading}
            >
              {mode === "signup" ? "Sign Up" : "Sign In"}
            </button>
            <button
              type="button"
              onClick={signInWithGoogle}
              className="flex-1 px-2 py-0.5 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-100 flex items-center justify-center gap-1 text-sm font-['Poppins'] disabled:opacity-50"
              disabled={loading}
            >
              <svg
                className="h-3 w-3"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.99.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C4.01 20.48 7.68 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.68 1 4.01 3.52 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Google
            </button>
          </div>
          <p className="text-center text-sm text-gray-600 font-['Poppins']">
            {mode === "signin"
              ? "Don't have an account?"
              : "Already have an account?"}
            <button
              type="button"
              onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
              className="text-sky-400 hover:underline ml-1 text-sm"
            >
              {mode === "signin" ? "Sign Up" : "Sign In"}
            </button>
          </p>
        </form>
      </div>
    </div>
  );
}
