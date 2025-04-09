"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import axios from "axios";
import { saveReading, saveReflection } from "@/actions/db";
import {
  ChartBarIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  BookOpenIcon,
} from "@heroicons/react/24/outline";
import {
  ShareIcon,
  HeartIcon,
  HandRaisedIcon,
  LightBulbIcon,
  ArrowUpIcon,
  XMarkIcon,
  PauseIcon,
  PlayIcon,
} from "@heroicons/react/24/solid";
import { createBrowserClient } from "@supabase/ssr";
import NavigationHeader from "@/components/NavigationHeader";
import { Badge } from "@/components/ui/badge";
import ThemeRecommendations from "@/components/ThemeRecommendations";

interface Commentary {
  historical_context: string;
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
  questions: string[];
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
  verse: string;
  question: string;
  answer: string;
  created_at: string;
  themes: string[];
  user: {
    name: string;
  };
}

interface SupabaseReflection {
  id: string;
  user_id: string;
  verse: string;
  question: string;
  answer: string;
  created_at: string;
  user: {
    name: string;
  };
}

const suggestedVerses = [
  "John 3:16",
  "Psalm 23:1",
  "Romans 8:28",
  "Philippians 4:13",
  "Jeremiah 29:11",
  "Proverbs 3:5-6",
];

const themeColors: { [key: string]: { bg: string; text: string } } = {
  faith: { bg: "bg-sky-400/20", text: "text-sky-400" },
  love: { bg: "bg-sky-400/20", text: "text-sky-400" },
  hope: { bg: "bg-sky-400/20", text: "text-sky-400" },
  grace: { bg: "bg-sky-400/20", text: "text-sky-400" },
  mercy: { bg: "bg-sky-400/20", text: "text-sky-400" },
  peace: { bg: "bg-sky-400/20", text: "text-sky-400" },
  wisdom: { bg: "bg-sky-400/20", text: "text-sky-400" },
  truth: { bg: "bg-sky-400/20", text: "text-sky-400" },
  salvation: { bg: "bg-sky-400/20", text: "text-sky-400" },
  righteousness: { bg: "bg-sky-400/20", text: "text-sky-400" },
  default: { bg: "bg-gray-400/20", text: "text-gray-400" },
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

// Update ThemeChip to include icons and new styling
export function ThemeChip({ theme }: { theme: string }) {
  const colors = getThemeColors(theme);
  const getThemeIcon = (theme: string) => {
    switch (theme.toLowerCase()) {
      case "trust":
      case "provision":
      case "guidance":
      case "faith":
      case "love":
      case "hope":
        return <HeartIcon className="h-4 w-4 text-sky-400 inline mr-1" />;
      default:
        return null;
    }
  };

  return (
    <span
      className={`px-3 py-1 rounded-full text-sm font-semibold ${colors.bg} ${colors.text} flex items-center hover:bg-sky-400/30 hover:scale-105 transition`}
    >
      {getThemeIcon(theme)}
      {theme}
    </span>
  );
}

export default function ReadingPage() {
  const [verse, setVerse] = useState("");
  const [verseContent, setVerseContent] = useState("");
  const [commentary, setCommentary] = useState<Commentary | null>(null);
  const [answer, setAnswer] = useState("");
  const [insight, setInsight] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: string; text: string } | null>(
    null
  );
  const [userId, setUserId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sharedReflections, setSharedReflections] = useState<Reflection[]>([]);
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
  const [currentInsightIndex, setCurrentInsightIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isUserIdChecked, setIsUserIdChecked] = useState(false);

  // Add scroll event listener for back to top button
  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 300);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Fetch shared reflections
  useEffect(() => {
    const fetchReflections = async () => {
      const { data: reflectionsData, error: reflectionsError } = await supabase
        .from("reflections")
        .select(
          `
          id,
          user_id,
          verse,
          question,
          answer,
          created_at,
          user:users!user_id(name)
        `
        )
        .eq("is_shared", true)
        .order("created_at", { ascending: false })
        .limit(5)
        .returns<SupabaseReflection[]>();

      if (reflectionsError) {
        console.error("Error fetching reflections:", reflectionsError);
        return;
      }

      // Fetch themes for each reflection
      const reflectionsWithThemes = await Promise.all(
        reflectionsData.map(async (reflection) => {
          const { data: themesData } = await supabase
            .from("themes")
            .select("name")
            .eq("user_id", reflection.user_id);

          return {
            id: reflection.id,
            verse: reflection.verse,
            question: reflection.question,
            answer: reflection.answer,
            created_at: reflection.created_at,
            themes: themesData?.map((t) => t.name) || [],
            user: {
              name: reflection.user.name,
            },
          } satisfies Reflection;
        })
      );

      setSharedReflections(reflectionsWithThemes);
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
  }, [supabase]);

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
        commentary: commentaryResponse.data.commentary,
        application: commentaryResponse.data.application,
        denominational_perspectives:
          commentaryResponse.data.denominational_perspectives,
        themes: commentaryResponse.data.themes,
        questions: commentaryResponse.data.questions,
      });

      // Save reading to database
      if (userId) {
        await saveReading(userId, verse);
      }

      // Clear any error messages
      setMessage(null);
    } catch (error: any) {
      console.error("Error:", error);
      setMessage({
        type: "error",
        text:
          error.response?.data?.error ||
          error.message ||
          "Failed to fetch verse or generate commentary",
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

    setSaving(true);
    setMessage(null);

    try {
      if (answer?.trim()) {
        const { error: reflectionError } = await supabase
          .from("reflections")
          .insert({
            user_id: userId,
            verse: verse,
            verse_text: verseContent,
            question: commentary.questions[0],
            answer: answer.trim(),
            insight: insight.trim(),
            is_shared: isShared,
          });

        if (reflectionError) throw reflectionError;

        // Save themes
        for (const theme of commentary.themes) {
          const { data: existingTheme } = await supabase
            .from("themes")
            .select("*")
            .eq("user_id", userId)
            .eq("name", theme)
            .single();

          if (existingTheme) {
            await supabase
              .from("themes")
              .update({ count: existingTheme.count + 1 })
              .eq("id", existingTheme.id);
          } else {
            await supabase.from("themes").insert({
              user_id: userId,
              name: theme,
              count: 1,
            });
          }
        }

        setMessage({ type: "success", text: "Reflection saved successfully!" });
        setSaved(true);

        // Navigate to metrics page after a short delay
        setTimeout(() => {
          router.push(`/metrics?userId=${userId}`);
        }, 1500);
      }
    } catch (error: any) {
      console.error("Error saving reflection:", error);
      setMessage({
        type: "error",
        text: `Failed to save reflection: ${error.message}`,
      });
    } finally {
      setSaving(false);
    }
  };

  // Add carousel effect
  useEffect(() => {
    if (!isPlaying || sharedReflections.length <= 1) return;

    const interval = setInterval(() => {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentInsightIndex((prevIndex) =>
          prevIndex === sharedReflections.length - 1 ? 0 : prevIndex + 1
        );
        setIsTransitioning(false);
      }, 500);
    }, 5500);

    return () => clearInterval(interval);
  }, [isPlaying, sharedReflections.length]);

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
    <div className="min-h-screen">
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
      <div className="container mx-auto flex flex-col lg:flex-row gap-6 px-4 py-8 pt-20 items-start">
        {/* Main Content Area (takes remaining space) */}
        <div className="lg:flex-1 w-full">
          {/* Header - Moved here, outside the grid but within the main content flow */}
          <div className="flex items-center mb-6">
            <BookOpenIcon className="h-8 w-8 text-sky-400 mr-2" />
            <h1 className="text-2xl font-bold text-white drop-shadow-md border-b-2 border-sky-400">
              Today's Reading
            </h1>
          </div>

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

              <form onSubmit={handleVerseSubmit}>
                <div className="relative">
                  <input
                    type="text"
                    value={verse}
                    onChange={(e) => setVerse(e.target.value)}
                    placeholder="Enter a verse (e.g., John 3:16)"
                    className="w-full p-3 border rounded bg-gray-800 text-white border-gray-600 text-lg focus:ring-2 focus:ring-sky-400 focus:outline-none pr-10"
                  />
                  {verse && (
                    <XMarkIcon
                      className="h-5 w-5 text-gray-400 hover:text-gray-100 cursor-pointer absolute right-3 top-1/2 transform -translate-y-1/2"
                      onClick={() => setVerse("")}
                    />
                  )}
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="p-2 bg-gradient-to-r from-sky-400 to-blue-500 text-white rounded hover:bg-sky-500 mt-2 w-full"
                >
                  Get Commentary
                </button>
                <button
                  type="button"
                  onClick={suggestVerse}
                  className="p-2 bg-sky-400/20 text-sky-400 rounded hover:bg-sky-400/30 mt-2 w-full"
                >
                  Suggest a Verse
                </button>
              </form>
            </div>
            {/* Placeholder/Loading/Verse/Commentary Section */}
            {!verseContent && !loading && (
              <div className="text-center p-4 bg-gray-800/50 bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg shadow-md border border-gray-700 hover:bg-gray-700/50 transition card-with-lines">
                <BookOpenIcon className="h-12 w-12 text-sky-400 mx-auto mt-4" />
                <p className="text-gray-400 italic mt-4">
                  Enter a verse to begin your study...
                </p>
              </div>
            )}
            {loading /* Simplified loading */ && (
              <div className="flex justify-center items-center h-20">
                <div className="animate-spin h-6 w-6 text-sky-400"></div>
              </div>
            )}
            {verseContent && (
              <div className="p-6 bg-gray-800/50 bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg shadow-md border border-gray-700 hover:bg-gray-700/50 transition card-with-lines">
                <h3 className="text-xl font-semibold text-white mb-4">
                  {verse}
                </h3>
                <p className="text-gray-200 text-lg mb-4 italic">
                  {verseContent}
                </p>
              </div>
            )}
            {commentary && (
              <>
                {/* Historical Context Card */}
                <div className="p-4 bg-gray-800/50 bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg shadow-md border border-gray-700 hover:bg-gray-700/50 transition card-with-lines">
                  <h3 className="text-lg font-semibold text-white mb-2">
                    Historical Context
                  </h3>
                  <p className="text-sm text-gray-200">
                    {commentary.historical_context}
                  </p>
                </div>
                {/* Commentary Card */}
                <div className="p-4 bg-gray-800/50 bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg shadow-md border border-gray-700 hover:bg-gray-700/50 transition card-with-lines">
                  <h3 className="text-lg font-semibold text-white mb-2">
                    Commentary
                  </h3>
                  <div className="space-y-4">
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
                  <p className="text-sm italic text-gray-200 mt-4">
                    {commentary.application}
                  </p>
                  <div className="p-2 bg-gray-700/50 rounded-lg mt-4">
                    <p className="text-sm font-bold text-white">
                      Key Themes:{" "}
                      {commentary.themes.map((theme, i) => (
                        <span key={i} className="mr-2">
                          <ThemeChip theme={theme} />
                        </span>
                      ))}
                    </p>
                  </div>
                </div>
                {/* Denominational Perspectives Card */}
                <div className="p-4 bg-gray-800/50 bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg shadow-md border border-gray-700 hover:bg-gray-700/50 transition card-with-lines">
                  <h3 className="text-lg font-semibold text-white mb-2">
                    Denominational Perspectives
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-200 font-semibold">
                        Protestant:
                      </p>
                      <p className="text-sm text-gray-200">
                        {commentary.denominational_perspectives.protestant}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-200 font-semibold">
                        Baptist:
                      </p>
                      <p className="text-sm text-gray-200">
                        {commentary.denominational_perspectives.baptist}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-200 font-semibold">
                        Catholic:
                      </p>
                      <p className="text-sm text-gray-200">
                        {commentary.denominational_perspectives.catholic}
                      </p>
                    </div>
                  </div>
                </div>
                {/* Reflection Question Card */}
                <div className="p-4 bg-gray-800/50 bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg shadow-md border border-gray-700 hover:bg-gray-700/50 transition card-with-lines">
                  <h3 className="text-lg font-semibold text-white mb-2">
                    Reflection Question
                  </h3>
                  <p className="text-base text-gray-200">
                    {commentary.questions[0]}
                  </p>
                  <textarea
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    placeholder="Type your answer here..."
                    className="w-full p-3 mt-4 border rounded bg-gray-800 text-white border-gray-600 text-lg focus:ring-2 focus:ring-sky-400 focus:outline-none"
                    rows={4}
                  />
                  <textarea
                    className="w-full p-2 border rounded bg-gray-800 text-white border-gray-600 mt-2"
                    placeholder="Share a key insight or application from your reflection (optional)"
                    value={insight}
                    onChange={(e) => setInsight(e.target.value)}
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
                    disabled={saving}
                    className="w-full p-3 bg-gradient-to-r from-sky-400 to-blue-500 text-white rounded hover:bg-sky-500 mt-4 text-lg flex items-center justify-center disabled:opacity-50"
                  >
                    {saving
                      ? "Saving..."
                      : saved
                      ? "Saved!"
                      : "Save Reflection"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Sidebar (Fixed width on large screens) */}
        <div
          className={`lg:w-1/3 w-full ${
            sidebarOpen ? "block" : "hidden"
          } md:block`}
        >
          <div className="sticky top-24 space-y-4">
            {" "}
            {/* Added space-y-4 */}
            {/* Sidebar Card for Reflections */}
            <div className="p-6 bg-gray-800/50 bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg shadow-md border border-gray-700 hover:bg-gray-700/50 transition card-with-lines">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-white drop-shadow-md border-b-2 border-sky-400 w-32">
                  Shared Reflections
                </h2>
                {sharedReflections.length > 1 && (
                  <button
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="hover:opacity-80 transition"
                  >
                    {isPlaying ? (
                      <PauseIcon className="h-5 w-5 text-sky-400 hover:text-sky-300 transition" />
                    ) : (
                      <PlayIcon className="h-5 w-5 text-sky-400 hover:text-sky-300 transition" />
                    )}
                  </button>
                )}
              </div>

              {sharedReflections.length > 0 ? (
                <>
                  <div
                    className="p-2 bg-gray-800/50 bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg shadow-md border border-gray-700 hover:bg-gray-700/50 transition text-sm"
                    style={{
                      opacity: isTransitioning ? 0 : 1,
                      transition: "opacity 0.5s ease-in-out",
                    }}
                  >
                    <div className="flex flex-wrap gap-1 mb-2">
                      {sharedReflections[currentInsightIndex].themes?.map(
                        (theme) => (
                          <ThemeChip
                            key={`${theme}-${sharedReflections[currentInsightIndex].id}`}
                            theme={theme}
                          />
                        )
                      )}
                    </div>
                    <p className="text-gray-200 text-sm mb-2">
                      {sharedReflections[currentInsightIndex].question}
                    </p>
                    <p className="text-gray-200 text-sm">
                      {sharedReflections[currentInsightIndex].answer.length >
                      150
                        ? `${sharedReflections[
                            currentInsightIndex
                          ].answer.slice(0, 150)}...`
                        : sharedReflections[currentInsightIndex].answer}
                    </p>
                    <p className="text-xs text-gray-400 mt-2">
                      -{" "}
                      {sharedReflections[currentInsightIndex].user?.name ||
                        "Anonymous"}
                    </p>
                  </div>

                  {sharedReflections.length > 1 && (
                    <div className="flex gap-2 justify-center mt-4">
                      {sharedReflections.map((_, i) => (
                        <button
                          key={i}
                          className={`h-3 w-3 rounded-full transition ${
                            i === currentInsightIndex
                              ? "bg-sky-400"
                              : "bg-gray-500 border border-gray-400 hover:bg-gray-400"
                          }`}
                          onClick={() => {
                            setCurrentInsightIndex(i);
                            setIsPlaying(false);
                          }}
                        />
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <p className="text-gray-400 italic text-center">
                  No reflections available yet.
                </p>
              )}

              {sharedReflections.length > 1 && (
                <button
                  onClick={() => setShowAllReflections(true)}
                  className="p-2 bg-gradient-to-r from-sky-400 to-blue-500 text-white rounded hover:bg-sky-500 w-full text-center mt-4"
                >
                  View All Insights
                </button>
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
          <div className="p-4 bg-gray-800/50 bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg shadow-md border border-gray-700 max-h-[80vh] overflow-y-auto w-11/12 max-w-4xl card-with-lines">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-white">All Insights</h2>
              <button
                onClick={() => setShowAllReflections(false)}
                className="text-gray-400 hover:text-gray-300"
              >
                ×
              </button>
            </div>
            <div className="space-y-4">
              {sharedReflections.map((reflection) => (
                <div
                  key={reflection.id}
                  className="p-3 bg-gray-800/50 bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg shadow-md border border-gray-700 hover:bg-gray-700/50 transition card-with-lines"
                >
                  <div className="flex gap-2 flex-wrap">
                    {reflection.themes?.map((theme) => (
                      <ThemeChip key={theme} theme={theme} />
                    ))}
                  </div>
                  <p className="text-gray-200 mt-2">{reflection.question}</p>
                  <p className="text-gray-200 mt-1">{reflection.answer}</p>
                  <p className="text-sm text-gray-400 mt-2">
                    - {reflection.user?.name || "Anonymous"}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
