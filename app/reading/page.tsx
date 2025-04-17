"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import axios from "axios";
import { saveReading, saveReflection } from "@/actions/db";
import {
  HeartIcon,
  SunIcon,
  GiftIcon,
  HandRaisedIcon,
  LightBulbIcon,
  CheckCircleIcon,
  ShieldCheckIcon,
  ScaleIcon,
  SparklesIcon,
  CheckIcon,
  ArrowDownIcon,
  LockClosedIcon,
  UserGroupIcon,
  UsersIcon,
  StarIcon,
  ArrowPathIcon,
  ClockIcon,
  PlayIcon,
  PauseIcon,
  BookOpenIcon,
  ChartBarIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ArrowUpIcon,
  XMarkIcon,
  ShareIcon,
  PlusIcon as CrossIcon,
  ChatBubbleLeftRightIcon as DoveIcon,
  HandRaisedIcon as HeartshakeIcon,
} from "@heroicons/react/24/solid";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import type { Session, User } from "@supabase/supabase-js";
import NavigationHeader from "@/components/NavigationHeader";
import { Badge } from "@/components/ui/badge";
import ThemeRecommendations from "@/components/ThemeRecommendations";
import CommentarySkeleton from "@/components/CommentarySkeleton";
import { ThemeChip } from "@/components/ThemeChip";
import { useAuth } from "@/context/AuthContext";

interface Commentary {
  historical_context: string;
  general_meaning: string;
  commentary: {
    summarize: string;
    expose: string;
    change: string;
    prepare: string;
  };
  application: string;
  denominational_perspectives: {
    protestant: string;
    baptist: string;
    catholic: string;
  };
  themes: string[];
  reflective_question: string;
}

interface SupabaseInsight {
  id: string;
  verse: string;
  summary: string;
  created_at: string;
  user: {
    name: string;
  };
}

interface SharedInsight {
  id: string;
  verse: string;
  summary: string;
  user: {
    name: string;
  };
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

interface Theme {
  bgColor: string;
  textColor: string;
  icon: React.ElementType;
}

const themes: Record<string, Theme> = {
  love: {
    bgColor: "bg-pink-600",
    textColor: "text-white",
    icon: HeartIcon,
  },
  faith: {
    bgColor: "bg-blue-600",
    textColor: "text-white",
    icon: CrossIcon,
  },
  hope: {
    bgColor: "bg-green-600",
    textColor: "text-white",
    icon: SunIcon,
  },
  wisdom: {
    bgColor: "bg-purple-600",
    textColor: "text-white",
    icon: LightBulbIcon,
  },
  forgiveness: {
    bgColor: "bg-yellow-600",
    textColor: "text-black",
    icon: HeartshakeIcon,
  },
  prayer: {
    bgColor: "bg-indigo-600",
    textColor: "text-white",
    icon: DoveIcon,
  },
};

const suggestedVerses = [
  "John 3:16",
  "Psalm 23:1",
  "Romans 8:28",
  "Philippians 4:13",
  "Jeremiah 29:11",
  "Proverbs 3:5-6",
];

const themeContent: {
  [key: string]: { definition: string; question: string };
} = {
  faith: {
    definition: "Complete trust and confidence in God's promises",
    question: "How does this verse strengthen your trust in God?",
  },
  love: {
    definition: "God's unconditional care and affection for humanity",
    question: "How do you experience God's love in your life today?",
  },
  hope: {
    definition: "Confident expectation of God's promises",
    question: "What hope does this verse give you for your current situation?",
  },
  grace: {
    definition: "God's unmerited favor and blessing",
    question: "How does God's grace manifest in this verse?",
  },
  mercy: {
    definition: "God's compassion and forgiveness towards sinners",
    question: "How does God's mercy change how you view others?",
  },
  peace: {
    definition: "Tranquility and harmony with God and others",
    question: "How can you apply this peace in your daily life?",
  },
  wisdom: {
    definition: "Divine insight and understanding",
    question: "What wisdom from this verse can you apply today?",
  },
  truth: {
    definition: "God's absolute and unchanging reality",
    question: "How does this truth challenge or comfort you?",
  },
  salvation: {
    definition: "Deliverance from sin and its consequences",
    question: "How does this verse deepen your understanding of salvation?",
  },
  righteousness: {
    definition: "Living in right relationship with God",
    question: "How does this verse guide righteous living?",
  },
};

function ReadingPageMainContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const { session, user, error: authError, loading: authLoading } = useAuth();
  const [verse, setVerse] = useState("");
  const [verseContent, setVerseContent] = useState("");
  const [commentary, setCommentary] = useState<Commentary | null>(null);
  const [answer, setAnswer] = useState("");
  const [isAnswerValid, setIsAnswerValid] = useState(false);
  const [insight, setInsight] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: string; text: string } | null>(
    null
  );
  const [userId, setUserId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showAllReflections, setShowAllReflections] = useState(false);
  const [isShared, setIsShared] = useState(true);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const supabase = createClientComponentClient();
  const [_currentInsightIndex, setCurrentInsightIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isUserIdChecked, setIsUserIdChecked] = useState(false);
  const [reflections, setReflections] = useState<Reflection[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showFullVerse, setShowFullVerse] = useState<Record<string, boolean>>(
    {}
  );
  const [username, setUsername] = useState<string>("");
  const [liking, setLiking] = useState<string | null>(null);
  const [likeError, setLikeError] = useState<string | null>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 300);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const fetchReflections = async () => {
      if (!userId) return;

      try {
        console.log("Fetching all shared reflections from the last 30 days");
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const { data: reflectionsData, error } = await supabase
          .from("reflections")
          .select("*")
          .eq("is_shared", true)
          .gte("created_at", thirtyDaysAgo.toISOString())
          .order("created_at", { ascending: false });

        if (error) {
          console.error("Error fetching reflections:", error);
          return;
        }

        if (!reflectionsData) {
          console.log("No reflections found");
          return;
        }

        console.log("Raw reflections from Supabase:", reflectionsData);

        const processedReflections = reflectionsData.map(
          (reflection: SupabaseReflection) => {
            console.log(
              "Reflection ID:",
              reflection.id,
              "Themes:",
              reflection.themes,
              "Type:",
              typeof reflection.themes,
              "Is array:",
              Array.isArray(reflection.themes)
            );

            return {
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
            };
          }
        );

        setReflections(processedReflections);
        console.log(
          "Processed reflections with themes:",
          processedReflections.map((r) => ({
            id: r.id,
            themes: r.themes,
          }))
        );
      } catch (error) {
        console.error("Error in fetchReflections:", error);
      }
    };

    fetchReflections();
    const subscription = supabase
      .channel("reflections")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "reflections",
          filter: "is_shared=true",
        },
        () => {
          fetchReflections();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase, userId]);

  useEffect(() => {
    const setupUser = async () => {
      if (!session || !user) {
        console.log(
          "Reading page: No valid session/user found, redirecting to /"
        );
        router.push("/");
        return;
      }

      if (authError) {
        console.error("Reading page: Auth error:", authError);
        router.push("/");
        return;
      }

      console.log("Reading page: User and session confirmed:", user);
      setUserId(user.id);

      try {
        const { data: existingUser, error: selectError } = await supabase
          .from("users")
          .select("id")
          .eq("id", user.id)
          .single();

        if (selectError && selectError.code !== "PGRST116") {
          console.error(
            "Reading page: Error checking user in database:",
            selectError
          );

          if (selectError.message?.includes("does not exist")) {
            console.log(
              "Reading page: User does not exist in database, creating entry..."
            );
            const defaultName = user.email
              ? user.email.split("@")[0]
              : "Anonymous";
            await supabase.from("users").insert([
              {
                id: user.id,
                name: defaultName,
                created_at: new Date().toISOString(),
              },
            ]);
          }
        }

        const { data: userProfile, error: profileError } = await supabase
          .from("users")
          .select("name")
          .eq("id", user.id)
          .single();

        if (profileError) {
          console.error(
            "Reading page: Error fetching user profile:",
            profileError
          );
          setUsername(user.email ? user.email.split("@")[0] : "User");
        } else {
          setUsername(
            userProfile.name || (user.email ? user.email.split("@")[0] : "User")
          );
        }
      } catch (err) {
        console.error("Reading page: Error verifying user in database:", err);
        setUsername(user.email ? user.email.split("@")[0] : "User");
      } finally {
        setIsUserIdChecked(true);
      }
    };

    setupUser();
  }, [session, user, authError, router, supabase]);

  const handleVerseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!verse.trim()) {
      setMessage({ type: "error", text: "Please enter a verse" });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const verseResponse = await axios.post("/api/verse", { verse });

      if (!verseResponse.data.passages || !verseResponse.data.passages[0]) {
        throw new Error(
          "Verse not found. Please check the reference format (e.g., John 3:16)"
        );
      }

      const verseText = verseResponse.data.passages[0];
      setVerseContent(verseText);

      const commentaryResponse = await axios.post("/api/commentary", {
        verse,
        content: verseText,
      });

      if (!commentaryResponse.data) {
        throw new Error("No commentary received");
      }

      setCommentary({
        historical_context: commentaryResponse.data.historical_context,
        general_meaning: commentaryResponse.data.general_meaning,
        commentary: commentaryResponse.data.reading_it_right,
        application: commentaryResponse.data.application,
        denominational_perspectives:
          commentaryResponse.data.denominational_perspectives,
        themes: commentaryResponse.data.themes,
        reflective_question: commentaryResponse.data.reflective_question,
      });

      if (userId) {
        await saveReading(userId, verse);
      }

      setMessage(null);
    } catch (error: unknown) {
      console.error("Error fetching verse:", error);
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      setMessage({
        type: "error",
        text: errorMessage || "Failed to fetch verse or generate commentary",
      });
    } finally {
      setLoading(false);
    }
  };

  const suggestVerse = () => {
    const randomVerse =
      suggestedVerses[Math.floor(Math.random() * suggestedVerses.length)];
    setVerse(randomVerse);
  };

  const handleSaveReflections = async () => {
    if (!userId) {
      setMessage({
        type: "error",
        text: "You must be logged in to save reflections",
      });
      return;
    }

    if (!commentary || !verse) {
      setMessage({
        type: "error",
        text: "No verse or commentary data available",
      });
      return;
    }

    if (!answer?.trim()) {
      setMessage({
        type: "error",
        text: "Please provide an answer to the reflection question",
      });
      return;
    }

    setSaving(true);
    setMessage(null);

    try {
      console.log("Attempting to save reflection with data:", {
        userId,
        verse,
        question: commentary.reflective_question,
        answer: answer.trim(),
        insight: insight.trim(),
        isShared,
        themes: commentary.themes,
      });

      const reflectionPayload = {
        user_id: userId,
        verse: verse,
        verse_text: verseContent,
        question: commentary.reflective_question,
        answer: answer.trim(),
        insight: insight.trim(),
        is_shared: isShared,
        themes: commentary.themes,
      };

      const { data: savedReflection, error: reflectionError } = await supabase
        .from("reflections")
        .insert(reflectionPayload)
        .select()
        .single();

      if (reflectionError) {
        console.error("Supabase reflection error:", {
          message: reflectionError.message,
          details: reflectionError.details,
          hint: reflectionError.hint,
          code: reflectionError.code,
        });
        throw new Error(
          `Failed to save reflection: ${reflectionError.message}`
        );
      }

      if (!savedReflection) {
        throw new Error("No reflection data returned after insert");
      }

      setMessage({ type: "success", text: "Reflection saved successfully!" });
      setSaved(true);

      setVerse("");
      setVerseContent("");
      setCommentary(null);
      setAnswer("");
      setInsight("");
      setIsShared(false);
      setReflections([]);
    } catch (error: unknown) {
      console.error("Error saving reflection:", error);
      setMessage({
        type: "error",
        text: error instanceof Error ? error.message : "An error occurred",
      });
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    if (!isPlaying || reflections.length <= 1) return;

    const interval = setInterval(() => {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentIndex((prevIndex) =>
          prevIndex === reflections.length - 1 ? 0 : prevIndex + 1
        );
        setIsTransitioning(false);
      }, 500);
    }, 5500);

    return () => clearInterval(interval);
  }, [isPlaying, reflections.length]);

  const handleLike = async (reflectionId: string, index: number) => {
    if (!user) return;
    if (index !== currentIndex) return;
    if (liking) return;

    const uuidRegex =
      /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
    if (!uuidRegex.test(reflectionId) || !uuidRegex.test(user.id)) {
      throw new Error("Invalid reflection ID or user ID");
    }

    setLiking(reflectionId);
    setLikeError(null);

    const hasLiked = reflections[index].likedBy.includes(user.id);
    const pLike = !hasLiked;

    console.log(
      "Calling toggle_like with:",
      reflectionId,
      user.id,
      pLike,
      "hasLiked:",
      hasLiked
    );

    try {
      const { data, error } = await supabase.rpc("toggle_like", {
        p_reflection_id: reflectionId,
        p_user_id: user.id,
        p_like: pLike,
      });

      if (error) throw error;

      console.log("Updated reflections:", data);

      setReflections((prev) =>
        prev.map((reflection, i) =>
          i === index
            ? {
                ...reflection,
                likes: data.likes,
                likedBy: data.liked_by,
              }
            : reflection
        )
      );
    } catch (err: unknown) {
      console.error("Error toggling like:", {
        message: err instanceof Error ? err.message : String(err),
        code: (err as any)?.code,
        details: (err as any)?.details,
        hint: (err as any)?.hint,
        status: (err as any)?.status,
        raw: err,
      });
      setLikeError("Failed to update like. Please try again.");
      setTimeout(() => setLikeError(null), 3000);
    } finally {
      setLiking(null);
    }
  };

  const handleAnswerChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newAnswer = e.target.value;
    setAnswer(newAnswer);
    setIsAnswerValid(newAnswer.length >= 10);
  };

  if (!isUserIdChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 text-sky-400"></div>
      </div>
    );
  }

  if (authError) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center text-red-400">
          <p>{authError}</p>
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

      <NavigationHeader isAuthenticated={true} currentPage="reading" />

      <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 relative z-10">
        <div className="bg-blue-900/30 border border-sky-500/20 p-6 rounded-lg mb-8">
          <h1 className="text-3xl font-bold text-gray-50 font-['Poppins'] mb-4">
            Reading
          </h1>
          <form onSubmit={handleVerseSubmit} className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <input
                type="text"
                value={verse}
                onChange={(e) => setVerse(e.target.value)}
                placeholder="Enter a verse (e.g., John 3:16)"
                className="flex-1 p-2 bg-gray-800 border border-sky-500/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sky-400 font-['Poppins']"
              />
              <button
                type="button"
                onClick={suggestVerse}
                className="bg-gray-700 text-gray-200 px-4 py-2 rounded-lg hover:bg-gray-600 transition-all font-['Poppins']"
              >
                Suggest Verse
              </button>
              <button
                type="submit"
                disabled={loading}
                className="bg-gradient-to-r from-sky-400 to-blue-500 text-white px-4 py-2 rounded-lg hover:from-sky-500 hover:to-blue-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-['Poppins']"
              >
                {loading ? "Loading..." : "Read"}
              </button>
            </div>
          </form>
          {message && (
            <p
              className={`mt-4 text-sm font-['Poppins'] ${
                message.type === "error" ? "text-red-400" : "text-green-400"
              }`}
            >
              {message.text}
            </p>
          )}
        </div>

        {loading ? (
          <CommentarySkeleton />
        ) : (
          commentary && (
            <div className="space-y-8">
              <div className="bg-blue-900/30 border border-sky-500/20 p-6 rounded-lg">
                <h2 className="text-2xl font-medium text-gray-50 font-['Poppins'] mb-4">
                  {verse}
                </h2>
                <p className="text-gray-200 italic font-['Poppins'] mb-4">
                  {verseContent}
                </p>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-medium text-gray-50 font-['Poppins'] mb-2">
                      Historical Context
                    </h3>
                    <p className="text-gray-200 font-['Poppins']">
                      {commentary.historical_context}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-xl font-medium text-gray-50 font-['Poppins'] mb-2">
                      General Meaning
                    </h3>
                    <p className="text-gray-200 font-['Poppins']">
                      {commentary.general_meaning}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-xl font-medium text-gray-50 font-['Poppins'] mb-2">
                      Reading it Right
                    </h3>
                    <div className="space-y-4 font-['Poppins']">
                      <div>
                        <h4 className="text-gray-300 font-medium">Summarize</h4>
                        <p className="text-gray-200">
                          {commentary.commentary.summarize}
                        </p>
                      </div>
                      <div>
                        <h4 className="text-gray-300 font-medium">Expose</h4>
                        <p className="text-gray-200">
                          {commentary.commentary.expose}
                        </p>
                      </div>
                      <div>
                        <h4 className="text-gray-300 font-medium">Change</h4>
                        <p className="text-gray-200">
                          {commentary.commentary.change}
                        </p>
                      </div>
                      <div>
                        <h4 className="text-gray-300 font-medium">Prepare</h4>
                        <p className="text-gray-200">
                          {commentary.commentary.prepare}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xl font-medium text-gray-50 font-['Poppins'] mb-2">
                      Application
                    </h3>
                    <p className="text-gray-200 font-['Poppins']">
                      {commentary.application}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-xl font-medium text-gray-50 font-['Poppins'] mb-2">
                      Denominational Perspectives
                    </h3>
                    <div className="space-y-4 font-['Poppins']">
                      <div>
                        <h4 className="text-gray-300 font-medium">
                          Protestant
                        </h4>
                        <p className="text-gray-200">
                          {commentary.denominational_perspectives.protestant}
                        </p>
                      </div>
                      <div>
                        <h4 className="text-gray-300 font-medium">Baptist</h4>
                        <p className="text-gray-200">
                          {commentary.denominational_perspectives.baptist}
                        </p>
                      </div>
                      <div>
                        <h4 className="text-gray-300 font-medium">Catholic</h4>
                        <p className="text-gray-200">
                          {commentary.denominational_perspectives.catholic}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-6">
                  <h3 className="text-xl font-medium text-gray-50 font-['Poppins'] mb-2">
                    Themes
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {commentary.themes.map((theme, index) => (
                      <ThemeChip key={`${theme}-${index}`} theme={theme} />
                    ))}
                  </div>
                </div>
              </div>

              <div className="bg-blue-900/30 border border-sky-500/20 p-6 rounded-lg">
                <h2 className="text-2xl font-medium text-gray-50 font-['Poppins'] mb-4">
                  Reflect
                </h2>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-xl font-medium text-gray-50 font-['Poppins'] mb-2">
                      Question
                    </h3>
                    <p className="text-gray-200 font-['Poppins']">
                      {commentary.reflective_question}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-xl font-medium text-gray-50 font-['Poppins'] mb-2">
                      Your Answer
                    </h3>
                    <textarea
                      value={answer}
                      onChange={handleAnswerChange}
                      placeholder="Write your reflection (minimum 10 characters)"
                      className="w-full p-2 bg-gray-800 border border-sky-500/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sky-400 font-['Poppins'] min-h-[100px]"
                    />
                    {!isAnswerValid && answer.length > 0 && (
                      <p className="text-red-400 text-sm font-['Poppins'] mt-1">
                        Answer must be at least 10 characters long
                      </p>
                    )}
                  </div>
                  <div>
                    <h3 className="text-xl font-medium text-gray-50 font-['Poppins'] mb-2">
                      Insight (Optional)
                    </h3>
                    <textarea
                      value={insight}
                      onChange={(e) => setInsight(e.target.value)}
                      placeholder="Share any additional insights"
                      className="w-full p-2 bg-gray-800 border border-sky-500/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sky-400 font-['Poppins'] min-h-[100px]"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="shareReflection"
                      checked={isShared}
                      onChange={(e) => setIsShared(e.target.checked)}
                      className="h-4 w-4 text-sky-400 focus:ring-sky-400 border-gray-300 rounded"
                    />
                    <label
                      htmlFor="shareReflection"
                      className="text-gray-200 font-['Poppins']"
                    >
                      Share my reflection publicly
                    </label>
                  </div>
                  <button
                    onClick={handleSaveReflections}
                    disabled={saving || !isAnswerValid}
                    className="bg-gradient-to-r from-sky-400 to-blue-500 text-white px-4 py-2 rounded-lg hover:from-sky-500 hover:to-blue-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-['Poppins']"
                  >
                    {saving ? "Saving..." : "Save Reflection"}
                  </button>
                </div>
              </div>
            </div>
          )
        )}

        <div className="mt-8">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="fixed top-16 right-4 sm:right-6 p-2 bg-gradient-to-r from-sky-400 to-blue-500 text-white rounded-full shadow-lg hover:from-sky-500 hover:to-blue-600 transition-all z-40 font-['Poppins']"
          >
            {sidebarOpen ? (
              <XMarkIcon className="h-6 w-6" />
            ) : (
              <ChartBarIcon className="h-6 w-6" />
            )}
          </button>
          <div
            className={`fixed top-0 right-0 h-full w-64 sm:w-80 bg-blue-900/80 border-l border-sky-500/20 shadow-lg transform transition-transform duration-300 z-50 ${
              sidebarOpen ? "translate-x-0" : "translate-x-full"
            }`}
          >
            <div className="p-4 sm:p-6 h-full overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-medium font-['Poppins'] text-gray-50">
                  Insights
                </h2>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="text-gray-400 hover:text-gray-300"
                >
                  ×
                </button>
              </div>
              <div className="space-y-4">
                {reflections.length > 0 ? (
                  <div className="space-y-4">
                    <div className="flex flex-wrap gap-2">
                      {reflections[currentIndex]?.themes ? (
                        reflections[currentIndex]?.themes.map(
                          (theme, index) => (
                            <ThemeChip
                              key={`${theme}-${index}`}
                              theme={theme}
                            />
                          )
                        )
                      ) : (
                        <>
                          <ThemeChip theme="faith" />
                          <ThemeChip theme="love" />
                          <ThemeChip theme="hope" />
                        </>
                      )}
                    </div>
                    <p className="text-gray-400 text-sm font-['Poppins']">
                      A user shared:
                    </p>
                    <p className="text-gray-200 font-['Poppins']">
                      {reflections[currentIndex]?.insight ||
                        reflections[currentIndex]?.answer ||
                        "No insights available."}
                    </p>
                  </div>
                ) : (
                  <p className="text-gray-400 italic font-['Poppins']">
                    No shared insights yet.
                  </p>
                )}
                <button
                  onClick={() => setShowAllReflections(true)}
                  className="mt-4 text-sky-400 hover:text-sky-300 font-['Poppins']"
                >
                  See All Reflections
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-blue-900/30 border border-sky-500/20 p-4 rounded-lg shadow-lg shadow-sky-400/10 bg-gradient-radial from-sky-500/10 to-transparent max-w-lg mx-auto">
          <h2 className="text-xl font-medium font-['Poppins'] text-gray-50 mb-4">
            Shared Reflections
          </h2>
          {reflections.length > 0 ? (
            <div className="relative">
              <div className="max-h-48 overflow-y-auto pr-1 custom-scrollbar">
                <div
                  className={`transition-opacity duration-500 ${
                    isTransitioning ? "opacity-0" : "opacity-100"
                  }`}
                >
                  <div className="p-4 bg-blue-900/50 border border-sky-500/20 rounded-lg bg-gradient-radial from-sky-500/10 to-transparent text-sm hover:bg-blue-900/70 transition-all">
                    <div className="flex flex-wrap gap-2">
                      {(() => {
                        console.log(
                          "Sidebar themes for reflection ID:",
                          reflections[currentIndex]?.id,
                          "Themes:",
                          reflections[currentIndex]?.themes,
                          "Values:",
                          reflections[currentIndex]?.themes?.join(", ") ||
                            "None",
                          "Current index:",
                          currentIndex,
                          "Total reflections:",
                          reflections.length
                        );

                        return reflections[currentIndex]?.themes ? (
                          reflections[currentIndex]?.themes.map(
                            (theme, index) => (
                              <ThemeChip
                                key={`${theme}-${index}`}
                                theme={theme}
                              />
                            )
                          )
                        ) : (
                          <>
                            <ThemeChip theme="faith" />
                            <ThemeChip theme="love" />
                            <ThemeChip theme="hope" />
                          </>
                        );
                      })()}
                    </div>
                    {reflections[currentIndex]?.verseText && (
                      <p className="text-sm text-gray-200 font-semibold mt-2 font-['Poppins']">
                        {reflections[currentIndex].verse} –{" "}
                        {showFullVerse[reflections[currentIndex].id]
                          ? reflections[currentIndex].verseText
                          : reflections[currentIndex].verseText.slice(0, 50) +
                            (reflections[currentIndex].verseText.length > 50
                              ? "..."
                              : "")}
                        {reflections[currentIndex].verseText.length > 50 && (
                          <button
                            onClick={() =>
                              setShowFullVerse((prev) => ({
                                ...prev,
                                [reflections[currentIndex].id]:
                                  !prev[reflections[currentIndex].id],
                              }))
                            }
                            className="text-sky-400 hover:text-sky-300 ml-2 font-['Poppins'] text-sm"
                          >
                            {showFullVerse[reflections[currentIndex].id]
                              ? "Show Less"
                              : "Show More"}
                          </button>
                        )}
                      </p>
                    )}
                    <div className="mt-4">
                      <p className="text-sm text-gray-400 font-['Poppins']">
                        A user shared:
                      </p>
                      <p className="text-sm text-gray-300 mt-1 font-['Poppins']">
                        {reflections[currentIndex].insight ||
                          reflections[currentIndex].answer ||
                          "John 3:16 – This verse reminds me of God's love..."}
                      </p>
                    </div>
                    <div className="mt-4">
                      <button
                        onClick={() =>
                          handleLike(reflections[currentIndex].id, currentIndex)
                        }
                        disabled={liking === reflections[currentIndex].id}
                        className={`px-3 py-1 rounded-full text-sm font-semibold bg-gradient-to-r from-sky-400/20 to-blue-500/20 text-gray-200 flex items-center hover:from-sky-400/30 hover:to-blue-500/30 transition transform hover:scale-110 font-['Poppins'] ${
                          liking === reflections[currentIndex].id
                            ? "opacity-50 cursor-not-allowed"
                            : ""
                        }`}
                      >
                        <HeartIcon
                          className={
                            user &&
                            reflections[currentIndex].likedBy.includes(user.id)
                              ? "h-4 w-4 text-red-500 mr-1"
                              : "h-4 w-4 text-sky-400 mr-1"
                          }
                        />
                        <span>{reflections[currentIndex].likes}</span>
                      </button>
                      {likeError && (
                        <p className="text-red-400 text-sm mt-2 font-['Poppins']">
                          {likeError}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-4 flex flex-col items-center">
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="h-6 w-6 text-sky-400 hover:text-blue-500 transition transform hover:scale-125"
                >
                  {isPlaying ? <PauseIcon /> : <PlayIcon />}
                </button>
                <div className="w-full h-1 bg-gray-700 rounded mt-2">
                  <div
                    className="h-1 bg-sky-400 transition-all duration-500"
                    style={{
                      width: `${
                        ((currentIndex + 1) / reflections.length) * 100
                      }%`,
                    }}
                  />
                </div>
                <div className="flex gap-2 justify-center mt-2">
                  {reflections.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        setCurrentIndex(index);
                        setIsPlaying(false);
                      }}
                      className={`h-2 w-2 rounded-full transition-all duration-300 ${
                        index === currentIndex
                          ? "bg-sky-400 scale-125"
                          : "bg-gray-400 hover:bg-gray-400 hover:scale-125"
                      }`}
                    />
                  ))}
                </div>
              </div>
              <Link
                href="/reflections"
                className="text-sky-400 hover:text-sky-300 mt-4 text-center block font-['Poppins'] text-sm sm:text-base"
              >
                See More Reflections
              </Link>
            </div>
          ) : (
            <p className="text-gray-400 italic font-['Poppins'] text-sm sm:text-base">
              No shared reflections yet.
            </p>
          )}
        </div>

        {showAllReflections && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="p-4 sm:p-6 bg-blue-900/30 border border-sky-500/20 rounded-lg bg-gradient-radial from-sky-500/10 to-transparent max-h-[80vh] overflow-y-auto w-11/12 max-w-4xl">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-medium font-['Poppins'] text-gray-50">
                  All Insights
                </h2>
                <button
                  onClick={() => setShowAllReflections(false)}
                  className="text-gray-400 hover:text-gray-300"
                >
                  ×
                </button>
              </div>
              <div className="space-y-4">
                {reflections.map((reflection, index) => (
                  <div
                    key={reflection.id}
                    className="bg-blue-900/50 border border-sky-500/20 rounded-lg p-4 sm:p-6 mb-4 hover:bg-blue-900/70 transition-all"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <p className="text-gray-400 text-sm font-['Poppins']">
                          {reflection.verse}
                        </p>
                        <p className="text-gray-300 mt-2 font-['Poppins']">
                          {reflection.verseText}
                        </p>
                      </div>
                      <button
                        onClick={() =>
                          handleLike(reflections[currentIndex].id, currentIndex)
                        }
                        disabled={liking === reflections[currentIndex].id}
                        className={`px-3 py-1 rounded-full text-sm font-semibold bg-gradient-to-r from-sky-400/20 to-blue-500/20 text-gray-200 flex items-center hover:from-sky-400/30 hover:to-blue-500/30 transition transform hover:scale-110 font-['Poppins'] ${
                          liking === reflections[currentIndex].id
                            ? "opacity-50 cursor-not-allowed"
                            : ""
                        }`}
                      >
                        <HeartIcon
                          className={
                            user &&
                            reflections[currentIndex].likedBy.includes(user.id)
                              ? "h-4 w-4 text-red-500 mr-1"
                              : "h-4 w-4 text-sky-400 mr-1"
                          }
                        />
                        <span>{reflections[currentIndex].likes}</span>
                      </button>
                    </div>
                    <div className="space-y-4 font-['Poppins']">
                      <div>
                        <h4 className="text-gray-300 font-medium mb-2">
                          {reflection.question}
                        </h4>
                        <p className="text-gray-200">{reflection.answer}</p>
                      </div>
                      {reflection.insight && (
                        <div>
                          <h4 className="text-gray-300 font-medium mb-2">
                            Insight
                          </h4>
                          <p className="text-gray-200">{reflection.insight}</p>
                        </div>
                      )}
                      <div className="flex flex-wrap gap-2">
                        {reflection.themes.map((theme) => (
                          <ThemeChip key={theme} theme={theme} />
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {showBackToTop && (
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="fixed bottom-4 right-4 p-2 bg-gradient-to-r from-sky-400 to-blue-500 text-white rounded-full shadow-lg hover:from-sky-500 hover:to-blue-600 transition-all font-['Poppins']"
          >
            <ArrowUpIcon className="h-6 w-6" />
          </button>
        )}
      </div>
    </div>
  );
}

export default function ReadingPage() {
  const router = useRouter();
  const { session, user, loading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading && !session) {
      router.push("/");
    }
  }, [session, authLoading, router]);

  if (authLoading || !session) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="animate-pulse flex flex-col items-center">
          <BookOpenIcon className="h-12 w-12 text-sky-400 mb-4" />
          <p className="text-gray-300">
            {authLoading
              ? "Loading your experience..."
              : "Redirecting to login..."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-900 pt-14 sm:pt-16">
      <NavigationHeader isAuthenticated={true} currentPage="reading" />
      <ReadingPageMainContent />
    </div>
  );
}
