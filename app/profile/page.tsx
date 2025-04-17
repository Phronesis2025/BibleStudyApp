"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import type { Session, User } from "@supabase/supabase-js";
import NavigationHeader from "@/components/NavigationHeader";
import { ThemeChip } from "@/components/ThemeChip";
import {
  BookOpenIcon,
  ChartBarIcon,
  StarIcon,
  HeartIcon,
  FireIcon,
  TrophyIcon,
} from "@heroicons/react/24/solid";
import {
  PencilIcon,
  ArrowLeftIcon,
  CheckIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

interface Reading {
  id: string;
  userId: string;
  verse: string;
  createdAt: string;
}

interface SupabaseReading {
  id: string;
  user_id: string;
  verse: string;
  created_at: string;
}

interface Reflection {
  id: string;
  userId: string;
  verse: string;
  verseText?: string;
  question: string;
  answer: string;
  insight?: string;
  isShared: boolean;
  createdAt: string;
  themes: string[];
  likes: number;
  likedBy: string[];
}

interface SupabaseReflection {
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

function ProfilePageMainContent() {
  const router = useRouter();
  const supabase = createClientComponentClient();
  const [userId, setUserId] = useState<string | null>(null);
  const [readings, setReadings] = useState<Reading[]>([]);
  const [reflections, setReflections] = useState<Reflection[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [sessionError, setSessionError] = useState<string | null>(null);
  const [isUserIdChecked, setIsUserIdChecked] = useState(false);
  const [username, setUsername] = useState<string>("");
  const [isEditingUsername, setIsEditingUsername] = useState(false);
  const [newUsername, setNewUsername] = useState<string>("");
  const [usernameError, setUsernameError] = useState<string | null>(null);
  const [usernameSuccess, setUsernameSuccess] = useState<string | null>(null);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError) {
          setSessionError("Failed to load session. Please try again.");
          console.error("Profile page: Session error:", sessionError);
          if (
            sessionError.message?.includes("JWT") ||
            sessionError.message?.includes("does not exist") ||
            sessionError.message?.includes("Refresh Token")
          ) {
            console.log("Profile page: Invalid token detected, signing out...");
            await supabase.auth.signOut();
            router.push("/");
          }
          return;
        }

        if (session) {
          setSession(session);

          const {
            data: { user },
            error: userError,
          } = await supabase.auth.getUser();

          if (userError) {
            setSessionError("Failed to load user. Please try again.");
            console.error("Profile page: User error:", userError);
            if (
              userError.message?.includes("JWT") ||
              userError.message?.includes("does not exist") ||
              userError.message?.includes("Refresh Token")
            ) {
              console.log(
                "Profile page: Invalid user token detected, signing out..."
              );
              await supabase.auth.signOut();
              router.push("/");
            }
            return;
          }

          if (user) {
            setUser(user);
            setUserId(user.id);
            try {
              const { data: userProfile, error: profileError } = await supabase
                .from("users")
                .select("name")
                .eq("id", user.id)
                .single();

              if (profileError) {
                console.error(
                  "Profile page: Error fetching user profile:",
                  profileError
                );
                setUsername(user.email ? user.email.split("@")[0] : "User");
              } else {
                setUsername(
                  userProfile.name ||
                    (user.email ? user.email.split("@")[0] : "User")
                );
                setNewUsername(
                  userProfile.name ||
                    (user.email ? user.email.split("@")[0] : "User")
                );
              }
            } catch (err) {
              setSessionError(
                "Failed to fetch user profile. Please try again."
              );
              console.error("Profile page: Error fetching user profile:", err);
              setUsername(user.email ? user.email.split("@")[0] : "User");
            }
          } else {
            console.log(
              "Profile page: Session but no user found, signing out..."
            );
            await supabase.auth.signOut();
            router.push("/");
          }
        } else {
          console.log("Profile page: No session found, redirecting to /");
          router.push("/");
        }
      } catch (error: any) {
        setSessionError("An unexpected error occurred. Please try again.");
        console.error("Profile page: Error checking session:", error);
        if (
          error.message?.includes("JWT") ||
          error.message?.includes("does not exist") ||
          error.message?.includes("Refresh Token")
        ) {
          console.log("Profile page: Auth error detected, signing out...");
          await supabase.auth.signOut();
          router.push("/");
        }
      } finally {
        setIsUserIdChecked(true);
      }
    };

    checkSession();
  }, [router, supabase]);

  useEffect(() => {
    const fetchReadingsAndReflections = async () => {
      if (!userId) {
        console.log(
          "fetchReadingsAndReflections: userId is null, skipping fetch"
        );
        return;
      }

      try {
        console.log("Fetching readings for userId:", userId);
        const { data: readingsData, error: readingsError } = await supabase
          .from("reading_log")
          .select("*")
          .eq("user_id", userId)
          .order("created_at", { ascending: false });

        if (readingsError) {
          console.error("Error fetching readings:", {
            message: readingsError.message,
            code: readingsError.code,
            details: readingsError.details,
            hint: readingsError.hint,
          });
          throw new Error("Failed to fetch readings");
        }

        console.log("Fetched readings:", readingsData);

        const processedReadings = readingsData.map(
          (reading: SupabaseReading) => ({
            id: reading.id,
            userId: reading.user_id,
            verse: reading.verse,
            createdAt: reading.created_at,
          })
        );

        setReadings(processedReadings);

        console.log("Fetching reflections for userId:", userId);
        const { data: reflectionsData, error: reflectionsError } =
          await supabase
            .from("reflections")
            .select("*")
            .eq("user_id", userId)
            .order("created_at", { ascending: false });

        if (reflectionsError) {
          console.error("Error fetching reflections:", {
            message: reflectionsError.message,
            code: reflectionsError.code,
            details: reflectionsError.details,
            hint: reflectionsError.hint,
          });
          throw new Error("Failed to fetch reflections");
        }

        console.log("Fetched reflections:", reflectionsData);

        const processedReflections = reflectionsData.map(
          (reflection: SupabaseReflection) => ({
            id: reflection.id,
            userId: reflection.user_id,
            verse: reflection.verse,
            verseText: reflection.verse_text,
            question: reflection.question,
            answer: reflection.answer,
            insight: reflection.insight,
            isShared: reflection.is_shared,
            createdAt: reflection.created_at,
            themes: Array.isArray(reflection.themes) ? reflection.themes : [],
            likes: reflection.likes || 0,
            likedBy: Array.isArray(reflection.liked_by)
              ? reflection.liked_by
              : [],
          })
        );

        setReflections(processedReflections);
      } catch (error) {
        console.error("Error in fetchReadingsAndReflections:", error);
      }
    };

    fetchReadingsAndReflections();
  }, [supabase, userId]);

  const handleUsernameUpdate = async () => {
    if (!newUsername.trim()) {
      setUsernameError("Username cannot be empty");
      return;
    }

    if (newUsername.length > 50) {
      setUsernameError("Username must be 50 characters or less");
      return;
    }

    try {
      const { error } = await supabase
        .from("users")
        .update({ name: newUsername.trim() })
        .eq("id", userId);

      if (error) {
        setUsernameError("Failed to update username. Please try again.");
        console.error("Error updating username:", error);
        return;
      }

      setUsername(newUsername.trim());
      setUsernameSuccess("Username updated successfully!");
      setIsEditingUsername(false);
      setUsernameError(null);
    } catch (err) {
      setUsernameError("An unexpected error occurred. Please try again.");
      console.error("Error updating username:", err);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  const totalReadings = readings.length;
  const totalReflections = reflections.length;
  const sharedReflections = reflections.filter((r) => r.isShared).length;
  const totalLikes = reflections.reduce((sum, r) => sum + (r.likes || 0), 0);

  const themeCounts: { [key: string]: number } = {};
  reflections.forEach((reflection) => {
    if (reflection.themes && Array.isArray(reflection.themes)) {
      reflection.themes.forEach((theme) => {
        themeCounts[theme] = (themeCounts[theme] || 0) + 1;
      });
    }
  });
  const favoriteThemes = Object.entries(themeCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([theme]) => theme);

  const calculateStreak = () => {
    if (readings.length === 0) return 0;

    const sortedReadings = [...readings].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    let streak = 1;
    let currentDate = new Date(sortedReadings[0].createdAt);
    currentDate.setHours(0, 0, 0, 0);

    for (let i = 1; i < sortedReadings.length; i++) {
      const readingDate = new Date(sortedReadings[i].createdAt);
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

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const lastReadingDate = new Date(sortedReadings[0].createdAt);
    lastReadingDate.setHours(0, 0, 0, 0);
    const daysSinceLastReading =
      (today.getTime() - lastReadingDate.getTime()) / (1000 * 60 * 60 * 24);

    return daysSinceLastReading <= 1 ? streak : 0;
  };
  const readingStreak = calculateStreak();

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
    .slice(-1)[0];
  const achievedReflectionMilestone = reflectionMilestones
    .filter((milestone) => totalReflections >= milestone.threshold)
    .slice(-1)[0];

  const popularReflections = reflections
    .filter((r) => r.isShared)
    .sort((a, b) => (b.likes || 0) - (a.likes || 0))
    .slice(0, 3);

  if (!isUserIdChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 text-sky-400"></div>
      </div>
    );
  }

  if (sessionError) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center text-red-400">
          <p>{sessionError}</p>
          <Link href="/" className="text-sky-400 hover:underline mt-4 block">
            Return to Home
          </Link>
        </div>
      </div>
    );
  }

  if (!userId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-400">
          Invalid state: User ID is missing. Redirecting...
        </p>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-gray-900 pt-14 sm:pt-16">
      <div className="absolute inset-0">
        <div className="absolute top-10 left-5 w-40 h-40 bg-sky-400/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 right-5 w-40 h-40 bg-sky-400/10 rounded-full blur-3xl"></div>
      </div>

      <NavigationHeader
        currentPage="profile"
        isAuthenticated={true}
        handleSignOut={handleSignOut}
      />

      <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 relative z-10">
        <div className="bg-blue-900/30 border border-sky-500/20 p-6 rounded-lg mb-8">
          <h1 className="text-3xl font-bold text-gray-50 font-['Poppins'] mb-4">
            Your Profile
          </h1>
          <div className="flex items-center mb-4">
            <h2 className="text-xl font-medium text-gray-50 font-['Poppins'] mr-2">
              Username: {username}
            </h2>
            {!isEditingUsername && (
              <button
                onClick={() => setIsEditingUsername(true)}
                className="text-sky-400 hover:text-sky-300 flex items-center"
              >
                <PencilIcon className="h-5 w-5 mr-1" />
                Edit
              </button>
            )}
          </div>
          {isEditingUsername && (
            <div className="space-y-2">
              <input
                type="text"
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                className="w-full max-w-xs p-2 bg-gray-800 border border-sky-500/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sky-400 font-['Poppins']"
                placeholder="Enter new username"
              />
              <div className="flex space-x-2">
                <button
                  onClick={handleUsernameUpdate}
                  className="px-4 py-2 bg-gradient-to-r from-sky-400 to-blue-500 text-white rounded-lg hover:from-sky-500 hover:to-blue-600 transition-all flex items-center font-['Poppins']"
                >
                  <CheckIcon className="h-5 w-5 mr-1" />
                  Save
                </button>
                <button
                  onClick={() => {
                    setIsEditingUsername(false);
                    setNewUsername(username);
                    setUsernameError(null);
                    setUsernameSuccess(null);
                  }}
                  className="px-4 py-2 bg-gray-700 text-gray-200 rounded-lg hover:bg-gray-600 transition-all flex items-center font-['Poppins']"
                >
                  <XMarkIcon className="h-5 w-5 mr-1" />
                  Cancel
                </button>
              </div>
              {usernameError && (
                <p className="text-red-400 text-sm">{usernameError}</p>
              )}
              {usernameSuccess && (
                <p className="text-green-400 text-sm">{usernameSuccess}</p>
              )}
            </div>
          )}
        </div>

        <div className="bg-blue-900/30 border border-sky-500/20 p-6 rounded-lg mb-8">
          <h2 className="text-2xl font-semibold text-gray-50 mb-4 font-['Poppins'] flex items-center">
            <ChartBarIcon className="h-6 w-6 mr-2 text-sky-400" />
            Your Activity
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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

        <div className="bg-blue-900/30 border border-sky-500/20 p-6 rounded-lg mb-8">
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

        <div className="bg-blue-900/30 border border-sky-500/20 p-6 rounded-lg mb-8">
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

        <div className="space-y-8">
          <div>
            <h2 className="text-2xl font-medium text-gray-50 font-['Poppins'] mb-4 flex items-center">
              <BookOpenIcon className="h-6 w-6 mr-2 text-sky-400" />
              Your Readings
            </h2>
            {readings.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {readings.map((reading) => (
                  <div
                    key={reading.id}
                    className="bg-blue-900/50 border border-sky-500/20 p-4 rounded-lg hover:bg-blue-900/70 transition-all"
                  >
                    <h3 className="text-lg font-medium text-gray-50 font-['Poppins']">
                      {reading.verse}
                    </h3>
                    <p className="text-gray-400 text-sm font-['Poppins']">
                      Read on {new Date(reading.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400 italic font-['Poppins']">
                No readings yet. Start exploring verses on the Reading page!
              </p>
            )}
          </div>

          <div>
            <h2 className="text-2xl font-medium text-gray-50 font-['Poppins'] mb-4 flex items-center">
              <BookOpenIcon className="h-6 w-6 mr-2 text-sky-400" />
              Your Reflections
            </h2>
            {reflections.length > 0 ? (
              <>
                {popularReflections.length > 0 && (
                  <div className="mb-8">
                    <h3 className="text-xl font-semibold text-gray-50 mb-3 font-['Poppins'] flex items-center">
                      <HeartIcon className="h-5 w-5 mr-2 text-red-500" />
                      Most Popular Shared Reflections
                    </h3>
                    <div className="space-y-4">
                      {popularReflections.map((reflection) => (
                        <div
                          key={reflection.id}
                          className="bg-blue-900/50 border border-sky-500/20 rounded-lg p-4 hover:bg-blue-900/70 transition-all"
                        >
                          <h3 className="text-lg font-medium text-gray-50 font-['Poppins']">
                            {reflection.verse}
                          </h3>
                          {reflection.verseText && (
                            <p className="text-gray-300 italic text-sm font-['Poppins'] mt-1">
                              {reflection.verseText}
                            </p>
                          )}
                          <p className="text-gray-400 text-sm font-['Poppins'] mt-1">
                            Reflected on{" "}
                            {new Date(
                              reflection.createdAt
                            ).toLocaleDateString()}
                          </p>
                          <div className="mt-2">
                            <p className="text-gray-300 font-['Poppins']">
                              <span className="font-medium">Question:</span>{" "}
                              {reflection.question}
                            </p>
                            <p className="text-gray-300 font-['Poppins'] mt-1">
                              <span className="font-medium">Answer:</span>{" "}
                              {reflection.answer}
                            </p>
                            {reflection.insight && (
                              <p className="text-gray-300 font-['Poppins'] mt-1">
                                <span className="font-medium">Insight:</span>{" "}
                                {reflection.insight}
                              </p>
                            )}
                          </div>
                          <p className="text-gray-400 text-sm font-['Poppins'] mt-2">
                            Likes: {reflection.likes || 0}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="space-y-4">
                  {reflections.map((reflection) => (
                    <div
                      key={reflection.id}
                      className="bg-blue-900/50 border border-sky-500/20 p-4 rounded-lg hover:bg-blue-900/70 transition-all"
                    >
                      <h3 className="text-lg font-medium text-gray-50 font-['Poppins']">
                        {reflection.verse}
                      </h3>
                      {reflection.verseText && (
                        <p className="text-gray-300 italic text-sm font-['Poppins'] mt-1">
                          {reflection.verseText}
                        </p>
                      )}
                      <p className="text-gray-400 text-sm font-['Poppins'] mt-1">
                        Reflected on{" "}
                        {new Date(reflection.createdAt).toLocaleDateString()}
                      </p>
                      <div className="mt-2">
                        <p className="text-gray-300 font-['Poppins']">
                          <span className="font-medium">Question:</span>{" "}
                          {reflection.question}
                        </p>
                        <p className="text-gray-300 font-['Poppins'] mt-1">
                          <span className="font-medium">Answer:</span>{" "}
                          {reflection.answer}
                        </p>
                        {reflection.insight && (
                          <p className="text-gray-300 font-['Poppins'] mt-1">
                            <span className="font-medium">Insight:</span>{" "}
                            {reflection.insight}
                          </p>
                        )}
                      </div>
                      <p className="text-gray-400 text-sm font-['Poppins'] mt-2">
                        Shared: {reflection.isShared ? "Yes" : "No"}
                      </p>
                      {reflection.themes.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {reflection.themes.map((theme, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-sky-400/20 text-sky-400 rounded-full text-sm font-['Poppins']"
                            >
                              {theme}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <p className="text-gray-400 italic font-['Poppins']">
                No reflections yet. Share your thoughts on the Reading page!
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center pt-14 sm:pt-16">
          <div className="text-white text-xl">Loading...</div>
        </div>
      }
    >
      <ProfilePageMainContent />
    </Suspense>
  );
}
