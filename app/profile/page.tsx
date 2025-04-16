"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import NavigationHeader from "@/components/NavigationHeader";
import { ThemeChip } from "@/app/reading/page";
import {
  BookOpenIcon,
  PencilIcon,
  ArrowLeftIcon,
  ChartBarIcon,
  StarIcon,
  HeartIcon,
  FireIcon,
  TrophyIcon,
} from "@heroicons/react/24/solid";

interface UserProfile {
  id: string;
  name: string;
  email: string;
}

interface Reading {
  id: string;
  user_id: string;
  verse: string;
  created_at: string;
}

interface Reflection {
  id: string;
  user_id: string;
  verse: string;
  verse_text?: string;
  question: string;
  answer: string;
  insight?: string;
  is_shared: boolean;
  created_at: string;
  themes: string[];
  likes: number;
  liked_by: string[];
}

export default function ProfilePage() {
  const router = useRouter();
  const supabase = createClientComponentClient();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [readings, setReadings] = useState<Reading[]>([]);
  const [reflections, setReflections] = useState<Reflection[]>([]);
  const [editingName, setEditingName] = useState(false);
  const [newName, setNewName] = useState("");
  const [message, setMessage] = useState<{ type: string; text: string } | null>(
    null
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError) {
          console.error("Profile page: Session error:", sessionError);
          router.push("/");
          return;
        }

        if (!session) {
          console.log("Profile page: No session found, redirecting to /");
          router.push("/");
          return;
        }

        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError) {
          console.error("Profile page: User error:", userError);
          router.push("/");
          return;
        }

        if (!user) {
          console.log("Profile page: No user found, redirecting to /");
          router.push("/");
          return;
        }

        // Fetch user profile from users table
        const { data: userProfile, error: profileError } = await supabase
          .from("users")
          .select("id, name, email")
          .eq("id", user.id)
          .single();

        if (profileError) {
          console.error(
            "Profile page: Error fetching user profile:",
            profileError
          );
          router.push("/");
          return;
        }

        setUser(userProfile);
        setNewName(userProfile.name);

        // Fetch user's readings
        const { data: readingsData, error: readingsError } = await supabase
          .from("reading_log")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        if (readingsError) {
          console.error(
            "Profile page: Error fetching readings:",
            readingsError
          );
          setMessage({ type: "error", text: "Failed to load readings." });
        } else {
          setReadings(readingsData || []);
        }

        // Fetch user's reflections
        const { data: reflectionsData, error: reflectionsError } =
          await supabase
            .from("reflections")
            .select("*")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false });

        if (reflectionsError) {
          console.error(
            "Profile page: Error fetching reflections:",
            reflectionsError
          );
          setMessage({ type: "error", text: "Failed to load reflections." });
        } else {
          setReflections(reflectionsData || []);
        }
      } catch (error) {
        console.error("Profile page: Unexpected error:", error);
        router.push("/");
      } finally {
        setLoading(false);
      }
    };

    checkSession();
  }, [router, supabase]);

  const handleNameUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newName.trim()) {
      setMessage({ type: "error", text: "Please enter a valid name." });
      return;
    }

    try {
      const { error } = await supabase
        .from("users")
        .update({ name: newName.trim() })
        .eq("id", user.id);

      if (error) {
        console.error("Profile page: Error updating name:", error);
        setMessage({ type: "error", text: "Failed to update name." });
        return;
      }

      setUser({ ...user, name: newName.trim() });
      setEditingName(false);
      setMessage({ type: "success", text: "Name updated successfully!" });
    } catch (error) {
      console.error("Profile page: Unexpected error updating name:", error);
      setMessage({ type: "error", text: "An unexpected error occurred." });
    }
  };

  // Calculate statistics
  const totalReadings = readings.length;
  const totalReflections = reflections.length;
  const sharedReflections = reflections.filter((r) => r.is_shared).length;
  const totalLikes = reflections.reduce((sum, r) => sum + (r.likes || 0), 0);

  // Calculate favorite themes
  const themeCounts: { [key: string]: number } = {};
  reflections.forEach((reflection) => {
    if (reflection.themes) {
      reflection.themes.forEach((theme) => {
        themeCounts[theme] = (themeCounts[theme] || 0) + 1;
      });
    }
  });
  const favoriteThemes = Object.entries(themeCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([theme]) => theme);

  // Calculate reading streak
  const calculateStreak = () => {
    if (readings.length === 0) return 0;

    // Sort readings by date in descending order
    const sortedReadings = [...readings].sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    let streak = 1;
    let currentDate = new Date(sortedReadings[0].created_at);
    currentDate.setHours(0, 0, 0, 0); // Normalize to start of day

    for (let i = 1; i < sortedReadings.length; i++) {
      const readingDate = new Date(sortedReadings[i].created_at);
      readingDate.setHours(0, 0, 0, 0);

      const diffDays =
        (currentDate.getTime() - readingDate.getTime()) / (1000 * 60 * 60 * 24);

      if (diffDays === 1) {
        streak++;
        currentDate = readingDate;
      } else if (diffDays > 1) {
        break;
      }
    }

    // Check if the streak is active (last reading is today or yesterday)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const lastReadingDate = new Date(sortedReadings[0].created_at);
    lastReadingDate.setHours(0, 0, 0, 0);
    const daysSinceLastReading =
      (today.getTime() - lastReadingDate.getTime()) / (1000 * 60 * 60 * 24);

    return daysSinceLastReading <= 1 ? streak : 0;
  };
  const readingStreak = calculateStreak();

  // Calculate milestones
  const readingMilestones = [
    { threshold: 10, message: "10 Readings! You're off to a great start!" },
    { threshold: 50, message: "50 Readings! You're a dedicated reader!" },
    { threshold: 100, message: "100 Readings! Amazing commitment!" },
  ];
  const reflectionMilestones = [
    { threshold: 5, message: "5 Reflections! Keep reflecting deeply!" },
    { threshold: 25, message: "25 Reflections! You're growing in faith!" },
    { threshold: 50, message: "50 Reflections! Incredible dedication!" },
  ];

  const achievedReadingMilestone = readingMilestones
    .filter((milestone) => totalReadings >= milestone.threshold)
    .slice(-1)[0]; // Get the highest achieved milestone
  const achievedReflectionMilestone = reflectionMilestones
    .filter((milestone) => totalReflections >= milestone.threshold)
    .slice(-1)[0];

  // Get most popular shared reflections
  const popularReflections = reflections
    .filter((r) => r.is_shared)
    .sort((a, b) => (b.likes || 0) - (a.likes || 0))
    .slice(0, 3);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-14 sm:pt-16">
        <div className="animate-spin h-8 w-8 text-sky-400"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-400">
          Invalid state: User not found. Redirecting...
        </p>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-gray-900 pt-14 sm:pt-16">
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1459666644539-a9755287d6ce?q=80&w=2012&auto=format&fit=crop')] bg-cover bg-center">
        <div className="absolute inset-0 bg-black/50"></div>
      </div>
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-40 h-40 bg-sky-400/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-40 h-40 bg-sky-400/10 rounded-full blur-3xl"></div>
      </div>

      <NavigationHeader currentPage="profile" isAuthenticated={true} />

      <div className="max-w-4xl mx-auto pt-6 pb-12 px-4 relative z-10">
        <div className="bg-blue-900/30 border border-sky-500/20 p-6 rounded-lg mb-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold text-gray-50 font-['Poppins']">
              Profile
            </h1>
            <div className="flex items-center">
              {editingName ? (
                <form
                  onSubmit={handleNameUpdate}
                  className="flex items-center gap-2"
                >
                  <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="px-3 py-1 bg-gray-800 border border-sky-500/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-sky-400 text-sm font-['Poppins']"
                    placeholder="Enter new name"
                    required
                  />
                  <button
                    type="submit"
                    className="px-3 py-1 bg-sky-400 text-white rounded-lg hover:bg-sky-500 text-sm font-['Poppins']"
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingName(false);
                      setNewName(user.name);
                    }}
                    className="px-3 py-1 bg-gray-600 text-white rounded-lg hover:bg-gray-500 text-sm font-['Poppins']"
                  >
                    Cancel
                  </button>
                </form>
              ) : (
                <button
                  onClick={() => setEditingName(true)}
                  className="flex items-center text-sky-400 hover:text-sky-300"
                >
                  <PencilIcon className="h-5 w-5 mr-2" />
                  Edit Name
                </button>
              )}
            </div>
          </div>
          {message && (
            <div
              className={`p-2 rounded mb-4 ${
                message.type === "error"
                  ? "text-red-400 bg-red-900"
                  : "text-green-400 bg-green-900"
              }`}
            >
              {message.text}
            </div>
          )}
          <div className="space-y-2">
            <p className="text-gray-200 font-['Poppins']">
              <span className="font-semibold">Name:</span> {user.name}
            </p>
            <p className="text-gray-200 font-['Poppins']">
              <span className="font-semibold">Email:</span> {user.email}
            </p>
          </div>
        </div>

        <div className="bg-blue-900/30 border border-sky-500/20 p-6 rounded-lg mb-6">
          <h2 className="text-2xl font-semibold text-gray-50 mb-4 font-['Poppins'] flex items-center">
            <ChartBarIcon className="h-6 w-6 mr-2 text-sky-400" />
            Your Activity
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 bg-blue-900/50 border border-sky-500/20 rounded-lg">
              <p className="text-gray-200 font-['Poppins']">
                <span className="font-semibold">Total Readings:</span>{" "}
                {totalReadings}
              </p>
            </div>
            <div className="p-4 bg-blue-900/50 border border-sky-500/20 rounded-lg">
              <p className="text-gray-200 font-['Poppins']">
                <span className="font-semibold">Total Reflections:</span>{" "}
                {totalReflections}
              </p>
            </div>
            <div className="p-4 bg-blue-900/50 border border-sky-500/20 rounded-lg">
              <p className="text-gray-200 font-['Poppins']">
                <span className="font-semibold">Shared Reflections:</span>{" "}
                {sharedReflections}
              </p>
            </div>
            <div className="p-4 bg-blue-900/50 border border-sky-500/20 rounded-lg">
              <p className="text-gray-200 font-['Poppins']">
                <span className="font-semibold">Total Likes:</span> {totalLikes}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-blue-900/30 border border-sky-500/20 p-6 rounded-lg mb-6">
          <h2 className="text-2xl font-semibold text-gray-50 mb-4 font-['Poppins'] flex items-center">
            <FireIcon className="h-6 w-6 mr-2 text-orange-400" />
            Reading Streaks & Milestones
          </h2>
          <div className="space-y-4">
            <div className="p-4 bg-blue-900/50 border border-sky-500/20 rounded-lg">
              <p className="text-gray-200 font-['Poppins'] flex items-center">
                <FireIcon className="h-5 w-5 mr-2 text-orange-400" />
                <span className="font-semibold">Reading Streak:</span>{" "}
                {readingStreak} {readingStreak === 1 ? "day" : "days"}
              </p>
              {readingStreak > 0 ? (
                <p className="text-gray-400 text-sm mt-1 font-['Poppins']">
                  Keep it up! Save a reading today to continue your streak.
                </p>
              ) : (
                <p className="text-gray-400 text-sm mt-1 font-['Poppins']">
                  Save a reading today to start a new streak!
                </p>
              )}
            </div>
            {(achievedReadingMilestone || achievedReflectionMilestone) && (
              <div className="p-4 bg-blue-900/50 border border-sky-500/20 rounded-lg">
                <p className="text-gray-200 font-['Poppins'] flex items-center">
                  <TrophyIcon className="h-5 w-5 mr-2 text-yellow-400" />
                  <span className="font-semibold">Milestones Achieved:</span>
                </p>
                <ul className="list-disc pl-6 mt-2 text-gray-200 font-['Poppins']">
                  {achievedReadingMilestone && (
                    <li>{achievedReadingMilestone.message}</li>
                  )}
                  {achievedReflectionMilestone && (
                    <li>{achievedReflectionMilestone.message}</li>
                  )}
                </ul>
              </div>
            )}
          </div>
        </div>

        <div className="bg-blue-900/30 border border-sky-500/20 p-6 rounded-lg mb-6">
          <h2 className="text-2xl font-semibold text-gray-50 mb-4 font-['Poppins'] flex items-center">
            <StarIcon className="h-6 w-6 mr-2 text-sky-400" />
            Favorite Themes
          </h2>
          {favoriteThemes.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {favoriteThemes.map((theme, index) => (
                <ThemeChip key={index} theme={theme} />
              ))}
            </div>
          ) : (
            <p className="text-gray-400 italic font-['Poppins']">
              No themes identified yet. Add more reflections to see your
              favorites!
            </p>
          )}
        </div>

        <div className="bg-blue-900/30 border border-sky-500/20 p-6 rounded-lg mb-6">
          <h2 className="text-2xl font-semibold text-gray-50 mb-4 font-['Poppins'] flex items-center">
            <BookOpenIcon className="h-6 w-6 mr-2 text-sky-400" />
            Saved Readings
          </h2>
          {readings.length > 0 ? (
            <div className="space-y-4">
              {readings.map((reading) => (
                <div
                  key={reading.id}
                  className="p-4 bg-blue-900/50 border border-sky-500/20 rounded-lg hover:bg-blue-900/70 transition-all"
                >
                  <p className="text-gray-200 font-['Poppins']">
                    <span className="font-semibold">{reading.verse}</span>
                  </p>
                  <p className="text-gray-400 text-sm font-['Poppins']">
                    Saved on {new Date(reading.created_at).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 italic font-['Poppins']">
              No saved readings yet.
            </p>
          )}
        </div>

        <div className="bg-blue-900/30 border border-sky-500/20 p-6 rounded-lg">
          <h2 className="text-2xl font-semibold text-gray-50 mb-4 font-['Poppins'] flex items-center">
            <BookOpenIcon className="h-6 w-6 mr-2 text-sky-400" />
            Your Reflections
          </h2>
          {reflections.length > 0 ? (
            <>
              {/* Most Popular Shared Reflections */}
              {popularReflections.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-xl font-semibold text-gray-50 mb-3 font-['Poppins'] flex items-center">
                    <HeartIcon className="h-5 w-5 mr-2 text-red-500" />
                    Most Popular Shared Reflections
                  </h3>
                  <div className="space-y-4">
                    {popularReflections.map((reflection) => (
                      <div
                        key={reflection.id}
                        className="p-4 bg-blue-900/50 border border-sky-500/20 rounded-lg hover:bg-blue-900/70 transition-all"
                      >
                        <p className="text-gray-200 font-['Poppins']">
                          <span className="font-semibold">
                            {reflection.verse}
                          </span>
                          {reflection.verse_text && (
                            <span className="text-gray-300">
                              {" "}
                              – {reflection.verse_text}
                            </span>
                          )}
                        </p>
                        <p className="text-gray-400 text-sm font-['Poppins']">
                          {reflection.question}
                        </p>
                        <p className="text-gray-200 mt-2 font-['Poppins']">
                          {reflection.answer}
                        </p>
                        {reflection.insight && (
                          <p className="text-gray-200 mt-2 font-['Poppins']">
                            <span className="font-semibold">Insight:</span>{" "}
                            {reflection.insight}
                          </p>
                        )}
                        <p className="text-gray-400 text-sm mt-2 font-['Poppins']">
                          Likes: {reflection.likes || 0} | Saved on{" "}
                          {new Date(reflection.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* All Reflections */}
              <div className="space-y-4">
                {reflections.map((reflection) => (
                  <div
                    key={reflection.id}
                    className="p-4 bg-blue-900/50 border border-sky-500/20 rounded-lg hover:bg-blue-900/70 transition-all"
                  >
                    <p className="text-gray-200 font-['Poppins']">
                      <span className="font-semibold">{reflection.verse}</span>
                      {reflection.verse_text && (
                        <span className="text-gray-300">
                          {" "}
                          – {reflection.verse_text}
                        </span>
                      )}
                    </p>
                    <p className="text-gray-400 text-sm font-['Poppins']">
                      {reflection.question}
                    </p>
                    <p className="text-gray-200 mt-2 font-['Poppins']">
                      {reflection.answer}
                    </p>
                    {reflection.insight && (
                      <p className="text-gray-200 mt-2 font-['Poppins']">
                        <span className="font-semibold">Insight:</span>{" "}
                        {reflection.insight}
                      </p>
                    )}
                    <p className="text-gray-400 text-sm mt-2 font-['Poppins']">
                      Shared: {reflection.is_shared ? "Yes" : "No"} | Likes:{" "}
                      {reflection.likes || 0} | Saved on{" "}
                      {new Date(reflection.created_at).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p className="text-gray-400 italic font-['Poppins']">
              No reflections yet.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
