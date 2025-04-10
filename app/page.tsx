"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { BookOpenIcon } from "@heroicons/react/24/outline";
import { createBrowserClient } from "@supabase/ssr";

export default function HomePage() {
  const [name, setName] = useState("");
  const [users, setUsers] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const router = useRouter();
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const fetchUsers = useCallback(async () => {
    const { data, error: fetchError } = await supabase
      .from("users")
      .select("*");
    if (fetchError) {
      setError("Failed to fetch users");
      return;
    }
    setUsers(data || []);
  }, [supabase, setError, setUsers]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Please enter a name");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const { data, error: createError } = await supabase
        .from("users")
        .insert([{ name: name.trim() }])
        .select()
        .single();

      if (createError) throw createError;

      setSuccess("User created successfully!");
      setName("");
      fetchUsers();
      router.push(`/reading?userId=${data.id}`);
    } catch (err) {
      // Log the error for debugging
      console.error("Error creating user:", err);
      setError("Failed to create user");
    } finally {
      setLoading(false);
    }
  };

  const handleUserSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const userId = e.target.value;
    if (userId) {
      router.push(`/reading?userId=${userId}`);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <BookOpenIcon className="h-16 w-16 text-sky-400 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-white mb-2">
            Bible Study App
          </h1>
          <p className="text-lg text-gray-200 italic">
            Deepen your understanding of Scripture through guided study
          </p>
          <p className="text-sm text-gray-400 mt-2">v1.0.5</p>
        </div>

        <div className="space-y-4 animate-fade-in">
          {error && (
            <div className="text-red-400 bg-red-900 rounded p-2 text-center">
              {error}
            </div>
          )}
          {success && (
            <div className="text-green-400 bg-green-900 rounded p-2 text-center">
              {success}
            </div>
          )}
          <div className="p-6 bg-gray-800/50 bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg shadow-md border border-gray-700 hover:bg-gray-700/50 transition card-with-lines">
            <form onSubmit={handleCreateUser} className="space-y-6">
              <div>
                <label
                  htmlFor="name"
                  className="block text-lg font-semibold text-white mb-2"
                >
                  Create New User
                </label>
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-3 border rounded bg-gray-700 text-white border-gray-600 text-lg focus:ring-2 focus:ring-sky-400 focus:outline-none"
                  placeholder="Enter your name"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full p-3 bg-gradient-to-r from-sky-400 to-blue-500 text-white rounded hover:bg-sky-500 text-lg flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <div className="animate-spin h-6 w-6 text-white mr-2">
                      <svg className="h-full w-full" viewBox="0 0 24 24">
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                    </div>
                    Creating...
                  </>
                ) : (
                  "Create User"
                )}
              </button>
            </form>

            <div className="mt-6">
              <label
                htmlFor="user-select"
                className="block text-lg font-semibold text-white mb-2"
              >
                Select Existing User (Go to Reading)
              </label>
              <select
                id="user-select"
                onChange={handleUserSelect}
                className="w-full p-3 border rounded bg-gray-700 text-white border-gray-600 text-lg focus:ring-2 focus:ring-sky-400 focus:outline-none"
              >
                <option value="">Choose a user...</option>
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
