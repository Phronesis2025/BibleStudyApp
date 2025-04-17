"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import type { Session } from "@supabase/supabase-js";
import { BookOpenIcon } from "@heroicons/react/24/outline";

export default function ResetPasswordPage() {
  const router = useRouter();
  const supabase = createClientComponentClient();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const [verifyingSession, setVerifyingSession] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (error) {
          console.error("Error getting session:", error.message);
          setError(
            "Session verification failed. Please try the password reset link again."
          );
          setVerifyingSession(false);
          return;
        }

        setSession(session);
        setVerifyingSession(false);

        if (!session) {
          setError(
            "No active session found. Please try the password reset link again."
          );
        }
      } catch (err) {
        console.error("Unexpected error during session check:", err);
        setError("An unexpected error occurred. Please try again.");
        setVerifyingSession(false);
      }
    };

    checkSession();
  }, [supabase]);

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    // Reset states
    setError(null);
    setSuccess(null);

    // Validate passwords
    if (password.length < 8) {
      setError("Password must be at least 8 characters long");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({ password });

      if (error) {
        setError(error.message || "Failed to update password");
        return;
      }

      setSuccess("Password updated successfully! Redirecting to login...");

      // Redirect after a delay
      setTimeout(() => {
        router.push("/");
      }, 2000);
    } catch (err) {
      console.error("Error updating password:", err);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (verifyingSession) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-t-2 border-b-2 border-sky-400 rounded-full mx-auto mb-4"></div>
          <p className="text-gray-200 font-['Poppins']">
            Verifying your session...
          </p>
        </div>
      </div>
    );
  }

  if (!session && !verifyingSession) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <div className="bg-blue-900/30 border border-sky-500/20 rounded-lg p-6 max-w-md w-full backdrop-blur-md">
          <div className="text-center mb-6">
            <BookOpenIcon className="h-12 w-12 text-sky-400 mx-auto mb-2" />
            <h1 className="text-2xl font-bold text-gray-50 font-['Poppins']">
              Reset Password
            </h1>
          </div>
          <div className="text-center">
            <p className="text-red-400 font-['Poppins']">{error}</p>
            <button
              onClick={() => router.push("/")}
              className="mt-4 px-6 py-2 bg-gradient-to-r from-sky-400 to-blue-500 text-white rounded-lg font-['Poppins'] hover:from-sky-500 hover:to-blue-600 transition-all"
            >
              Return to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="bg-blue-900/30 border border-sky-500/20 rounded-lg p-6 max-w-md w-full backdrop-blur-md">
        <div className="text-center mb-6">
          <BookOpenIcon className="h-12 w-12 text-sky-400 mx-auto mb-2" />
          <h1 className="text-2xl font-bold text-gray-50 font-['Poppins']">
            Reset Your Password
          </h1>
          <p className="text-gray-300 mt-2 font-['Poppins']">
            Please enter your new password below
          </p>
        </div>

        <form onSubmit={handlePasswordUpdate} className="space-y-4">
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-200 font-['Poppins'] mb-1"
            >
              New Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 bg-gray-800 border border-sky-500/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sky-400 font-['Poppins']"
              placeholder="Enter new password"
              required
            />
          </div>

          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium text-gray-200 font-['Poppins'] mb-1"
            >
              Confirm New Password
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-3 py-2 bg-gray-800 border border-sky-500/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sky-400 font-['Poppins']"
              placeholder="Confirm new password"
              required
            />
          </div>

          {error && (
            <p className="text-red-400 text-sm font-['Poppins']">{error}</p>
          )}

          {success && (
            <p className="text-green-400 text-sm font-['Poppins']">{success}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-2 bg-gradient-to-r from-sky-400 to-blue-500 text-white rounded-lg hover:from-sky-500 hover:to-blue-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-['Poppins']"
          >
            {loading ? "Updating..." : "Update Password"}
          </button>

          <div className="text-center">
            <button
              type="button"
              onClick={() => router.push("/")}
              className="text-sky-400 hover:text-sky-300 font-['Poppins'] text-sm"
            >
              Return to Login
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
