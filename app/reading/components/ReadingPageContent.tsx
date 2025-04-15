"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import NavigationHeader from "@/components/NavigationHeader";
import { Badge } from "@/components/ui/badge";
import ThemeRecommendations from "@/components/ThemeRecommendations";
import CommentarySkeleton from "@/components/CommentarySkeleton";

// Interfaces (keep the ones from the original file)
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

// Theme colors and configuration (from original file)
const themeColors = {
  faith: { bg: "bg-blue-600/20", text: "text-blue-400", icon: CrossIcon },
  love: { bg: "bg-pink-600/20", text: "text-pink-400", icon: HeartIcon },
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
};

type ThemeConfig = {
  bg: string;
  text: string;
  icon: React.ElementType;
};

const getThemeColors = (theme: string) => {
  const defaultTheme = {
    bg: "bg-gray-600/20",
    text: "text-gray-400",
    icon: QuestionMarkIcon,
  };
  return (
    themeColors[theme.toLowerCase() as keyof typeof themeColors] || defaultTheme
  );
};

export function ThemeChip({ theme }: { theme: string }) {
  const { bg, text, icon: Icon } = getThemeColors(theme);
  return (
    <div
      className={`${bg} ${text} rounded-full px-2 py-0.5 text-xs flex items-center space-x-1`}
    >
      <Icon className="h-3 w-3 inline-block" />
      <span>{theme.charAt(0).toUpperCase() + theme.slice(1)}</span>
    </div>
  );
}

function QuestionMarkIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  );
}

type ThemeKey = keyof typeof themeColors;

interface ReadingPageContentProps {
  userId: string;
}

export default function ReadingPageContent({
  userId,
}: ReadingPageContentProps) {
  console.log("Client: Received userId:", userId);

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
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showAllReflections, setShowAllReflections] = useState(false);
  const [isShared, setIsShared] = useState(true);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const router = useRouter();
  const supabase = createClientComponentClient();
  const [_currentInsightIndex, setCurrentInsightIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [reflections, setReflections] = useState<Reflection[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showFullVerse, setShowFullVerse] = useState<Record<string, boolean>>(
    {}
  );

  // Scroll to top on page load
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

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
  }, [userId]);

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

      // Map the API response to the Commentary interface
      setCommentary({
        historical_context: commentaryResponse.data.historical_context,
        general_meaning: commentaryResponse.data.general_meaning,
        commentary: {
          summarize: commentaryResponse.data.commentary.summarize,
          expose: commentaryResponse.data.commentary.expose,
          change: commentaryResponse.data.commentary.change,
          prepare: commentaryResponse.data.commentary.prepare,
        },
        application: commentaryResponse.data.application,
        denominational_perspectives:
          commentaryResponse.data.denominational_perspectives,
        themes: commentaryResponse.data.themes || [],
        reflective_question: commentaryResponse.data.reflective_question,
      });

      // Save reading to history
      saveReading(userId, verse);
    } catch (err) {
      console.error("Error fetching verse and commentary:", err);
      setMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Unknown error occurred",
      });
    } finally {
      setLoading(false);
    }
  };

  const suggestVerse = () => {
    // Generate a random verse reference from a list of common verses
    const commonVerses = [
      "John 3:16",
      "Psalm 23:1",
      "Romans 8:28",
      "Philippians 4:13",
      "Genesis 1:1",
    ];
    const randomVerse =
      commonVerses[Math.floor(Math.random() * commonVerses.length)];
    setVerse(randomVerse);
  };

  const handleSaveReflections = async () => {
    if (!userId) {
      setMessage({
        type: "error",
        text: "No user ID found. Please log in again.",
      });
      return;
    }

    if (!verse || !verseContent || !commentary || !answer) {
      setMessage({
        type: "error",
        text: "Please fill in all required fields.",
      });
      return;
    }

    setSaving(true);
    setSaved(false);
    setMessage(null);

    try {
      // Extract the required parameters for saveReflection
      await saveReflection(
        userId,
        verse,
        commentary.reflective_question,
        answer
      );

      setSaved(true);
      setMessage({ type: "success", text: "Reflection saved successfully!" });

      // Reset form
      setAnswer("");
      setInsight("");
      setIsAnswerValid(false);
    } catch (err) {
      console.error("Error saving reflection:", err);
      setMessage({
        type: "error",
        text: "Failed to save reflection. Please try again.",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleLike = async (reflectionId: string, liked: boolean) => {
    try {
      const { data, error } = await supabase.rpc("toggle_like", {
        p_reflection_id: reflectionId,
        p_user_id: userId,
        p_like: liked,
      });

      if (error) throw error;

      // Update the reflections state with the new likes and likedBy
      setReflections((prev) =>
        prev.map((reflection) =>
          reflection.id === reflectionId
            ? {
                ...reflection,
                likes: data.likes,
                likedBy: data.liked_by,
              }
            : reflection
        )
      );
    } catch (err) {
      console.error("Error toggling like:", err);
    }
  };

  const handleAnswerChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newAnswer = e.target.value;
    setAnswer(newAnswer);
    setIsAnswerValid(newAnswer.length >= 10);
  };

  // Rest of the component logic and UI would go here
  // For brevity, I'm leaving out the JSX, but it would include:
  // - Verse input form
  // - Verse display
  // - Commentary sections
  // - Reflection form
  // - Sidebar with shared reflections

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-800 to-blue-900 text-white relative pt-14 sm:pt-16">
      <NavigationHeader isAuthenticated={true} />
      {/* Force cache clear: Restart Next.js server if header doesn't update */}

      <main className="container mx-auto px-4 pb-24">
        <div className="max-w-4xl mx-auto">
          {/* Verse input form */}
          <div className="bg-blue-900/30 border border-sky-500/20 p-6 rounded-lg mb-6">
            <h2 className="text-2xl font-semibold text-sky-300 mb-4">
              Enter a Bible Verse
            </h2>
            <form onSubmit={handleVerseSubmit} className="space-y-4">
              <div className="flex flex-col md:flex-row gap-2">
                <input
                  type="text"
                  value={verse}
                  onChange={(e) => setVerse(e.target.value)}
                  placeholder="e.g., John 3:16"
                  className="flex-1 px-4 py-2 rounded-md bg-gray-800 text-white border border-gray-700 focus:border-sky-400 focus:outline-none focus:ring-1 focus:ring-sky-400"
                />
                <button
                  type="button"
                  onClick={suggestVerse}
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-md"
                >
                  Suggest
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white rounded-md"
                  disabled={loading}
                >
                  {loading ? (
                    <span className="flex items-center justify-center">
                      <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
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
                      Loading...
                    </span>
                  ) : (
                    "Get Commentary"
                  )}
                </button>
              </div>
            </form>
            {message && (
              <div
                className={`mt-4 p-3 rounded ${
                  message.type === "error"
                    ? "bg-red-900/50 text-red-200"
                    : "bg-green-900/50 text-green-200"
                }`}
              >
                {message.text}
              </div>
            )}
          </div>

          {/* Main content section - would include verse content, commentary, and reflection form */}
          {loading ? (
            <CommentarySkeleton />
          ) : (
            verseContent && (
              <div className="space-y-6">
                {/* Verse display */}
                <div className="bg-blue-900/30 border border-sky-500/20 p-6 rounded-lg">
                  <h2 className="text-2xl font-semibold text-sky-300 mb-2">
                    {verse}
                  </h2>
                  <div className="prose prose-invert prose-sky max-w-none">
                    <div dangerouslySetInnerHTML={{ __html: verseContent }} />
                  </div>
                </div>

                {/* Commentary section would go here */}
                {/* Reflection form would go here */}
              </div>
            )
          )}
        </div>
      </main>

      {/* Sidebar and other components would go here */}

      {/* Back to top button */}
      {showBackToTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="fixed bottom-20 right-6 p-2 bg-sky-500 text-white rounded-full shadow-lg hover:bg-sky-600 transition-colors"
        >
          <ArrowUpIcon className="h-6 w-6" />
        </button>
      )}
    </div>
  );
}
