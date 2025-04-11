"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import axios from "axios";
import { saveReading, saveReflection } from "@/actions/db";
import {
  HeartIcon,
  HeartIcon as HeartIconSolid,
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
import { createBrowserClient } from "@supabase/ssr";
import NavigationHeader from "@/components/NavigationHeader";
import { Badge } from "@/components/ui/badge";
import ThemeRecommendations from "@/components/ThemeRecommendations";
import CommentarySkeleton from "@/components/CommentarySkeleton";

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

type ThemeConfig = {
  bg: string;
  text: string;
  icon: React.ElementType;
};

const themeColors: { [key: string]: ThemeConfig } = {
  faith: { bg: "bg-blue-600/20", text: "text-blue-400", icon: CrossIcon },
  love: { bg: "bg-pink-600/20", text: "text-pink-400", icon: HeartIconSolid },
  hope: { bg: "bg-green-600/20", text: "text-green-400", icon: SunIcon },
  grace: { bg: "bg-purple-600/20", text: "text-purple-400", icon: GiftIcon },
  mercy: { bg: "bg-pink-600/20", text: "text-pink-400", icon: HandRaisedIcon },
  peace: { bg: "bg-green-600/20", text: "text-green-400", icon: DoveIcon },
  wisdom: {
    bg: "bg-indigo-600/20",
    text: "text-indigo-400",
    icon: LightBulbIcon,
  },
  truth: { bg: "bg-teal-600/20", text: "text-teal-400", icon: CheckCircleIcon },
  salvation: {
    bg: "bg-orange-600/20",
    text: "text-orange-400",
    icon: ShieldCheckIcon,
  },
  righteousness: {
    bg: "bg-amber-600/20",
    text: "text-amber-400",
    icon: ScaleIcon,
  },
  joy: { bg: "bg-yellow-600/20", text: "text-yellow-400", icon: SparklesIcon },
  forgiveness: {
    bg: "bg-pink-600/20",
    text: "text-pink-400",
    icon: HeartshakeIcon,
  },
  obedience: { bg: "bg-blue-600/20", text: "text-blue-400", icon: CheckIcon },
  humility: {
    bg: "bg-indigo-600/20",
    text: "text-indigo-400",
    icon: ArrowDownIcon,
  },
  trust: { bg: "bg-teal-600/20", text: "text-teal-400", icon: LockClosedIcon },
  prayer: { bg: "bg-purple-600/20", text: "text-purple-400", icon: DoveIcon },
  service: { bg: "bg-green-600/20", text: "text-green-400", icon: UsersIcon },
  holiness: { bg: "bg-amber-600/20", text: "text-amber-400", icon: StarIcon },
  redemption: {
    bg: "bg-orange-600/20",
    text: "text-orange-400",
    icon: ArrowPathIcon,
  },
  eternity: { bg: "bg-cyan-600/20", text: "text-cyan-400", icon: ClockIcon },
  teaching: {
    bg: "bg-violet-600/20",
    text: "text-violet-400",
    icon: BookOpenIcon,
  },
  accountability: {
    bg: "bg-rose-600/20",
    text: "text-rose-400",
    icon: UserGroupIcon,
  },
  default: { bg: "bg-gray-600/20", text: "text-gray-400", icon: StarIcon },
};

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

const getThemeColors = (theme: string) => {
  const normalizedTheme = theme.toLowerCase();
  return themeColors[normalizedTheme] || themeColors.default;
};

// Update ThemeChip to better handle invalid themes
export function ThemeChip({ theme }: { theme: string }) {
  const themeKey = (theme || "").toLowerCase();
  const themeConfig = themeColors[themeKey] || themeColors.default;
  const Icon = themeConfig.icon;

  return (
    <span
      className={`px-3 py-1 rounded-full text-sm font-semibold ${themeConfig.bg} ${themeConfig.text} flex items-center gap-1 hover:scale-105 transition`}
    >
      {Icon && <Icon className="h-4 w-4" />}
      {theme || "Theme"}
    </span>
  );
}

// Add type for theme keys
type ThemeKey = keyof typeof themeColors;

// Create a client component for the content that uses useSearchParams
function ReadingPageContent() {
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
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  const [_currentInsightIndex, setCurrentInsightIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isUserIdChecked, setIsUserIdChecked] = useState(false);
  const [reflections, setReflections] = useState<Reflection[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showFullVerse, setShowFullVerse] = useState<Record<string, boolean>>(
    {}
  );

  // Add scroll event listener for back to top button
  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 300);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Fetch shared reflections from the last 30 days (from all users)
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
            // Log themes for each reflection
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
    // Set up real-time subscription
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
    console.log("Reading Page: useEffect running, checking searchParams...");
    const id = searchParams.get("userId");

    if (id) {
      console.log("Reading Page: Found userId in params:", id);
      setUserId(id);
    } else {
      console.error(
        "Reading Page: No userId found in searchParams! Redirecting to home."
      );
      router.push("/");
    }
    setIsUserIdChecked(true);
  }, [searchParams, router]);

  const handleVerseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!verse.trim()) {
      setMessage({ type: "error", text: "Please enter a verse" });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      // First fetch the verse content from ESV API
      const verseResponse = await axios.post("/api/verse", { verse });

      if (!verseResponse.data.passages || !verseResponse.data.passages[0]) {
        throw new Error(
          "Verse not found. Please check the reference format (e.g., John 3:16)"
        );
      }

      const verseText = verseResponse.data.passages[0];
      setVerseContent(verseText);

      // Then get AI commentary
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
        commentary: commentaryResponse.data.commentary,
        application: commentaryResponse.data.application,
        denominational_perspectives:
          commentaryResponse.data.denominational_perspectives,
        themes: commentaryResponse.data.themes,
        reflective_question: commentaryResponse.data.reflective_question,
      });

      // Save reading to database
      if (userId) {
        await saveReading(userId, verse);
      }

      // Clear any error messages
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

      // Save reflection with themes
      const reflectionPayload = {
        user_id: userId,
        verse: verse,
        verse_text: verseContent,
        question: commentary.reflective_question,
        answer: answer.trim(),
        insight: insight.trim(),
        is_shared: isShared,
        themes: commentary.themes, // Save themes directly in the reflection
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

      // Navigate to metrics page after a short delay
      setTimeout(() => {
        router.push(`/metrics?userId=${userId}`);
      }, 1500);
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

  // Update the carousel effect
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

  const handleLike = async (reflectionId: string, liked: boolean) => {
    if (!userId) {
      setMessage({
        type: "error",
        text: "You must be logged in to like reflections",
      });
      return;
    }

    try {
      console.log("Sending like request:", { userId, reflectionId, liked });

      const response = await fetch("/api/like", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, reflectionId, like: !liked }),
      });

      const data = await response.json();
      console.log("Like response:", { status: response.status, data });

      if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`);
      }

      if (data.success) {
        console.log("Updating reflections state with:", data);
        setReflections((prevReflections) =>
          prevReflections.map((r) =>
            r.id === reflectionId
              ? {
                  ...r,
                  likes: data.likes,
                  likedBy: data.likedBy || [],
                }
              : r
          )
        );
        setMessage({
          type: "success",
          text: liked ? "Reflection unliked" : "Reflection liked",
        });
      } else {
        throw new Error(data.error || "Failed to update like status");
      }
    } catch (error: unknown) {
      console.error("Error liking reflection:", {
        error,
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      });
      setMessage({
        type: "error",
        text:
          error instanceof Error
            ? error.message
            : "Failed to like reflection. Please try again.",
      });
    }
  };

  // Update answer validation when answer changes
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
    <div className="min-h-screen bg-gradient-to-b from-gray-800 to-blue-900 text-white relative">
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(15, 23, 42, 0.1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(56, 189, 248, 0.2);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(56, 189, 248, 0.4);
        }
      `}</style>
      <div className="absolute inset-0 bg-[url('/images/bible-background.jpg')] bg-cover bg-center">
        <div className="absolute inset-0 bg-gray-900 opacity-70"></div>
      </div>
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-40 h-40 bg-sky-400/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-40 h-40 bg-sky-400/10 rounded-full blur-3xl"></div>
      </div>
      {/* Fixed Navigation */}
      <nav className="fixed top-0 left-0 right-0 bg-gray-900/90 backdrop-blur-md p-4 z-10 shadow-md">
        <div className="flex justify-between items-center max-w-7xl mx-auto">
          <Link
            href="/"
            className="text-white hover:text-sky-400 transition text-lg font-semibold"
          >
            Home
          </Link>
          <div className="flex gap-4">
            <Link
              href="/reading"
              className={`text-white hover:text-sky-400 transition text-lg font-semibold ${
                pathname === "/reading"
                  ? "text-sky-400 border-b-2 border-sky-400 pb-1"
                  : ""
              }`}
            >
              Reading
            </Link>
            <Link
              href={`/metrics?userId=${userId}`}
              className={`text-white hover:text-sky-400 transition text-lg font-semibold`}
            >
              Metrics
            </Link>
          </div>
        </div>
      </nav>

      {/* Apply flex layout for desktop, stack for mobile, ensure items-start */}
      <div className="max-w-6xl mx-auto py-12 px-4 relative z-10">
        <div className="flex flex-col lg:flex-row gap-6 pt-20 items-start">
          {/* Main Content Area (takes remaining space) */}
          <div className="lg:flex-1 w-full">
            {/* Header - Moved here, outside the grid but within the main content flow */}
            <div className="flex flex-col items-center mb-6">
              <BookOpenIcon className="h-8 w-8 text-sky-400 mr-2" />
              <h1 className="text-5xl font-bold font-['Poppins'] bg-gradient-to-r from-sky-400 to-blue-600 bg-clip-text text-transparent mb-2 text-center animate-pop-bounce">
                Explore the Word
              </h1>
              <p className="text-gray-300 mb-4 text-center">
                Enter a verse to dive into its meaning, context, and
                application.
              </p>
            </div>

            {/* Reading it Right Explanation */}
            <p className="text-gray-300 text-sm mt-2 mb-4 text-center">
              <span className="font-medium">Reading it Right</span>: Based on 2
              Timothy 3:16-17, this method uses Scripture's four
              purposes—teaching, reproof, correction, and training—to guide your
              study. The commentary below summarizes the verse's main teaching,
              exposes areas for reflection, suggests changes to align with God's
              will, and prepares you for His plan through a reflective question.
              Let this structure help you grow closer to God as you explore His
              Word!
            </p>

            {/* Verse Input and Subsequent Content Wrapper */}
            <div className="mt-0 space-y-4">
              {" "}
              {/* Added space-y-4 for consistent spacing between cards */}
              {/* Verse Input Card */}
              <div className="p-4 bg-gray-800/50 bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg shadow-md border border-gray-700 hover:bg-gray-700/50 transition card-with-lines">
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

                <form
                  onSubmit={handleVerseSubmit}
                  className="w-full max-w-md mx-auto"
                >
                  <div className="relative">
                    <input
                      type="text"
                      value={verse}
                      onChange={(e) => setVerse(e.target.value)}
                      placeholder="Enter a verse (e.g., John 3:16)"
                      className="w-full p-3 bg-gray-800 border border-sky-500/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sky-400"
                      aria-label="Enter a Bible verse"
                    />
                    {verse && (
                      <XMarkIcon
                        className="h-5 w-5 text-gray-400 hover:text-gray-100 cursor-pointer absolute right-3 top-1/2 transform -translate-y-1/2"
                        onClick={() => setVerse("")}
                      />
                    )}
                  </div>
                  <div className="flex flex-col sm:flex-row gap-4 mt-2">
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-6 py-3 bg-gradient-to-r from-sky-400 to-blue-500 text-white rounded-lg hover:from-sky-500 hover:to-blue-600 text-lg font-semibold transition-all hover:animate-bounce disabled:opacity-50 flex-1"
                    >
                      {loading ? "Loading..." : "Search"}
                    </button>
                    <button
                      type="button"
                      onClick={suggestVerse}
                      className="px-6 py-3 bg-blue-900/50 border border-sky-500/20 text-sky-400 rounded-lg hover:bg-blue-900/70 text-lg transition-all flex-1"
                    >
                      Suggest a Verse
                    </button>
                  </div>
                </form>
              </div>
              {/* Placeholder/Loading/Verse/Commentary Section */}
              {!verseContent && !loading && (
                <div className="text-center p-4 sm:p-6 bg-blue-900/30 border border-sky-500/20 rounded-lg bg-gradient-radial from-sky-500/10 to-transparent mb-8">
                  <BookOpenIcon className="h-12 w-12 text-sky-400 mx-auto mt-4" />
                  <p className="text-gray-400 italic mt-4">
                    Enter a verse to begin your study...
                  </p>
                </div>
              )}
              {loading && (
                <div className="bg-blue-900/30 border border-sky-500/20 p-4 sm:p-6 rounded-lg bg-gradient-radial from-sky-500/10 to-transparent mb-8">
                  <div className="flex justify-center my-8">
                    <div className="animate-spin h-10 w-10 text-sky-400 mr-2">
                      <svg
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
                    <span className="text-sky-400 text-lg">
                      Loading commentary...
                    </span>
                  </div>
                </div>
              )}
              {verseContent && (
                <div className="bg-blue-900/30 border border-sky-500/20 p-4 sm:p-6 rounded-lg bg-gradient-radial from-sky-500/10 to-transparent mb-8 animate-fade-in">
                  <h2 className="text-2xl font-medium font-['Poppins'] text-gray-50 mb-4">
                    {verse}
                  </h2>
                  <p className="text-gray-200 italic mb-4">{verseContent}</p>

                  {commentary && (
                    <>
                      <h3 className="text-xl font-medium text-gray-50 mb-2">
                        General Meaning
                      </h3>
                      <p className="text-gray-200 mb-4">
                        {commentary?.general_meaning}
                      </p>

                      <hr className="border-sky-500/20 my-4" />

                      <h3 className="text-xl font-medium text-gray-50 mb-2">
                        Historical Context
                      </h3>
                      <p className="text-gray-200 mb-4">
                        {commentary?.historical_context}
                      </p>

                      <hr className="border-sky-500/20 my-4" />

                      <h3 className="text-xl font-medium text-gray-50 mb-2">
                        Reading it Right
                      </h3>
                      <div className="space-y-4 mb-4">
                        <div>
                          <p className="text-sm text-gray-200 font-semibold">
                            Summary:
                          </p>
                          <p className="text-sm text-gray-200">
                            {commentary.commentary.summarize}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-200 font-semibold">
                            Expose:
                          </p>
                          <p className="text-sm text-gray-200">
                            {commentary.commentary.expose}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-200 font-semibold">
                            Change:
                          </p>
                          <p className="text-sm text-gray-200">
                            {commentary.commentary.change}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-200 font-semibold">
                            Prepare:
                          </p>
                          <p className="text-sm text-gray-200">
                            {commentary.commentary.prepare}
                          </p>
                        </div>
                      </div>

                      <hr className="border-sky-500/20 my-4" />

                      <h3 className="text-xl font-medium text-gray-50 mb-2">
                        Application
                      </h3>
                      <p className="text-gray-200 mb-4">
                        {commentary?.application}
                      </p>

                      <hr className="border-sky-500/20 my-4" />

                      <h3 className="text-xl font-medium text-gray-50 mb-2">
                        Denominational Perspectives
                      </h3>
                      <p className="text-gray-300 italic text-sm mb-2">
                        How do different denominations view this verse?
                      </p>
                      <div className="space-y-4 mb-4">
                        <div>
                          <p className="text-sm text-gray-200 font-semibold">
                            Protestant:
                          </p>
                          <p className="text-sm text-gray-200">
                            {commentary?.denominational_perspectives.protestant}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-200 font-semibold">
                            Baptist:
                          </p>
                          <p className="text-sm text-gray-200">
                            {commentary?.denominational_perspectives.baptist}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-200 font-semibold">
                            Catholic:
                          </p>
                          <p className="text-sm text-gray-200">
                            {commentary?.denominational_perspectives.catholic}
                          </p>
                        </div>
                      </div>

                      <hr className="border-sky-500/20 my-4" />

                      <h3 className="text-xl font-medium text-gray-50 mb-2">
                        Key Themes
                      </h3>
                      <div className="flex flex-wrap gap-2 mb-4">
                        {commentary?.themes?.map((theme, index) => (
                          <ThemeChip key={index} theme={theme} />
                        ))}
                      </div>
                    </>
                  )}
                </div>
              )}
              {commentary && (
                <>
                  {/* Reflection Question Card */}
                  <div className="bg-blue-900/30 border border-sky-500/20 p-4 sm:p-6 rounded-lg bg-gradient-radial from-sky-500/10 to-transparent mb-8 animate-fade-in">
                    <h2 className="text-2xl font-medium font-['Poppins'] text-gray-50 mb-4">
                      Reflection Question
                    </h2>
                    <p className="text-base text-gray-200">
                      {commentary?.reflective_question}
                    </p>
                    <textarea
                      value={answer}
                      onChange={handleAnswerChange}
                      placeholder="Reflect on how this verse speaks to your life today…"
                      className="w-full p-3 mt-4 bg-gray-800 border border-sky-500/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sky-400"
                      rows={4}
                    />
                    <textarea
                      className="w-full p-3 mt-2 bg-gray-800 border border-sky-500/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sky-400"
                      placeholder="Share a key insight or application from your reflection (optional)"
                      value={insight}
                      onChange={(e) => setInsight(e.target.value)}
                      rows={2}
                    />
                    <div className="flex items-center space-x-2 mt-4">
                      <input
                        type="checkbox"
                        id="sharing-toggle"
                        checked={isShared}
                        onChange={(e) => setIsShared(e.target.checked)}
                        className="h-4 w-4 text-sky-400 rounded border-gray-300 focus:ring-sky-400"
                      />
                      <label
                        htmlFor="sharing-toggle"
                        className="text-gray-400 hover:text-gray-100 transition"
                      >
                        <ShareIcon className="h-5 w-5 text-sky-400 inline mr-2" />
                        Share my reflection with the community
                      </label>
                    </div>
                    <button
                      onClick={handleSaveReflections}
                      disabled={saving || !isAnswerValid}
                      className="w-full px-6 py-3 bg-gradient-to-r from-sky-400 to-blue-500 text-white rounded-lg hover:from-sky-500 hover:to-blue-600 text-lg font-semibold transition-all hover:animate-bounce mt-4 disabled:opacity-50 flex items-center justify-center"
                    >
                      {saving
                        ? "Saving..."
                        : saved
                        ? "Saved!"
                        : isAnswerValid
                        ? "Save Reflection"
                        : "Enter at least 10 characters"}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Sidebar (Fixed width on large screens) */}
          <div className="lg:w-1/3 w-full lg:sticky lg:top-24 space-y-4 self-start">
            <div className="bg-blue-900/30 border border-sky-500/20 p-4 sm:p-6 rounded-lg bg-gradient-radial from-sky-500/10 to-transparent">
              <h2 className="text-xl font-medium font-['Poppins'] text-gray-50 mb-4">
                Shared Reflections
              </h2>
              {reflections.length > 0 ? (
                <div className="relative">
                  <div className="max-h-60 overflow-y-auto pr-1 custom-scrollbar">
                    <div
                      className={`transition-opacity duration-500 ${
                        isTransitioning ? "opacity-0" : "opacity-100"
                      }`}
                    >
                      <div className="p-4 bg-blue-900/50 border border-sky-500/20 rounded-lg bg-gradient-radial from-sky-500/10 to-transparent text-sm hover:bg-blue-900/70 transition-all">
                        <div className="flex flex-wrap gap-2">
                          {(() => {
                            // Enhanced debugging log for sidebar themes
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
                              // Display all 3 theme tags (OpenAI now returns exactly 3)
                              reflections[currentIndex]?.themes.map(
                                (theme, index) => (
                                  <ThemeChip
                                    key={`${theme}-${index}`}
                                    theme={theme}
                                  />
                                )
                              )
                            ) : (
                              // Show default themes if no themes are available (fallback)
                              <>
                                <ThemeChip theme="faith" />
                                <ThemeChip theme="love" />
                                <ThemeChip theme="hope" />
                              </>
                            );
                          })()}
                        </div>
                        {/* Verse Text Section */}
                        {reflections[currentIndex]?.verseText && (
                          <p className="text-sm text-gray-200 font-semibold mt-2">
                            {reflections[currentIndex].verse} –{" "}
                            {showFullVerse[reflections[currentIndex].id]
                              ? reflections[currentIndex].verseText
                              : reflections[currentIndex].verseText.slice(
                                  0,
                                  50
                                ) +
                                (reflections[currentIndex].verseText.length > 50
                                  ? "..."
                                  : "")}
                            {reflections[currentIndex].verseText.length >
                              50 && (
                              <button
                                onClick={() =>
                                  setShowFullVerse((prev) => ({
                                    ...prev,
                                    [reflections[currentIndex].id]:
                                      !prev[reflections[currentIndex].id],
                                  }))
                                }
                                className="text-sky-400 hover:text-sky-300 ml-2"
                              >
                                {showFullVerse[reflections[currentIndex].id]
                                  ? "Show Less"
                                  : "Show More"}
                              </button>
                            )}
                          </p>
                        )}
                        {/* User Content Section */}
                        <div className="mt-4">
                          <p className="text-sm text-gray-400">
                            A user shared:
                          </p>
                          <p className="text-sm text-gray-200 mt-1">
                            {reflections[currentIndex].insight ||
                              reflections[currentIndex].answer}
                          </p>
                        </div>
                        {/* Like Button Section */}
                        <div className="mt-4">
                          <button
                            onClick={() =>
                              handleLike(
                                reflections[currentIndex].id,
                                reflections[currentIndex].likedBy?.includes(
                                  userId
                                ) || false
                              )
                            }
                            className="px-3 py-1 rounded-full text-sm font-semibold bg-gradient-to-r from-sky-400/20 to-blue-500/20 text-gray-200 flex items-center hover:from-sky-400/30 hover:to-blue-500/30 transition transform hover:scale-110"
                          >
                            <HeartIcon
                              className={`h-4 w-4 mr-1 ${
                                reflections[currentIndex].likedBy?.includes(
                                  userId
                                )
                                  ? "text-red-500"
                                  : "text-sky-400"
                              }`}
                            />
                            {reflections[currentIndex].likedBy?.includes(userId)
                              ? "Liked"
                              : "Like"}{" "}
                            ({reflections[currentIndex].likes || 0})
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* Carousel Controls */}
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
                              : "bg-gray-500 hover:bg-gray-400"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <Link
                    href="/reflections"
                    className="text-sky-400 hover:text-sky-300 mt-4 text-center block hover:animate-bounce"
                  >
                    See More Reflections
                  </Link>
                </div>
              ) : (
                <p className="text-gray-400 italic">
                  No shared reflections yet.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Sidebar Toggle */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="fixed bottom-4 right-4 p-3 bg-gradient-to-r from-sky-400 to-blue-500 text-white rounded-full md:hidden"
        >
          <ChevronRightIcon className="h-6 w-6" />
        </button>

        {/* Back to Top Button */}
        {showBackToTop && (
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="fixed bottom-16 right-4 p-3 bg-gradient-to-r from-sky-400 to-blue-500 text-white rounded-full"
          >
            <ArrowUpIcon className="h-6 w-6" />
          </button>
        )}
      </div>

      {/* Modal for All Reflections */}
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
              {reflections.map((reflection) => (
                <div
                  key={reflection.id}
                  className="bg-blue-900/50 border border-sky-500/20 rounded-lg p-4 sm:p-6 mb-4 hover:bg-blue-900/70 transition-all"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <p className="text-gray-400 text-sm">
                        {reflection.verse}
                      </p>
                      <p className="text-gray-300 mt-2">
                        {reflection.verseText}
                      </p>
                    </div>
                    <button
                      onClick={() =>
                        handleLike(
                          reflection.id,
                          reflection.likedBy.includes(userId || "")
                        )
                      }
                      className="px-3 py-1 rounded-full text-sm font-semibold bg-gradient-to-r from-sky-400/20 to-blue-500/20 text-gray-200 flex items-center hover:from-sky-400/30 hover:to-blue-500/30 transition transform hover:scale-110"
                    >
                      <HeartIcon
                        className={
                          reflection.likedBy.includes(userId || "")
                            ? "h-4 w-4 text-red-500 mr-1"
                            : "h-4 w-4 text-sky-400 mr-1"
                        }
                      />
                      <span>{reflection.likes}</span>
                    </button>
                  </div>
                  <div className="space-y-4">
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
    </div>
  );
}

// Main component that uses Suspense
export default function ReadingPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-white text-xl">Loading...</div>
        </div>
      }
    >
      <ReadingPageContent />
    </Suspense>
  );
}
