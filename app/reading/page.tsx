"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import axios from "axios";
import { saveReading, saveReflection } from "@/actions/db";
import {
  ChartBarIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";
import { createBrowserClient } from "@supabase/ssr";
import NavigationHeader from "@/components/NavigationHeader";
import { Badge } from "@/components/ui/badge";
import ThemeRecommendations from "@/components/ThemeRecommendations";

interface Commentary {
  commentary: string;
  application: string;
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

const themeColors: { [key: string]: { bg: string; text: string } } = {
  // Spiritual themes
  faith: {
    bg: "bg-indigo-100 dark:bg-indigo-900",
    text: "text-indigo-800 dark:text-indigo-200",
  },
  love: {
    bg: "bg-rose-100 dark:bg-rose-900",
    text: "text-rose-800 dark:text-rose-200",
  },
  hope: {
    bg: "bg-emerald-100 dark:bg-emerald-900",
    text: "text-emerald-800 dark:text-emerald-200",
  },
  grace: {
    bg: "bg-purple-100 dark:bg-purple-900",
    text: "text-purple-800 dark:text-purple-200",
  },
  mercy: {
    bg: "bg-sky-100 dark:bg-sky-900",
    text: "text-sky-800 dark:text-sky-200",
  },
  peace: {
    bg: "bg-blue-100 dark:bg-blue-900",
    text: "text-blue-800 dark:text-blue-200",
  },
  wisdom: {
    bg: "bg-amber-100 dark:bg-amber-900",
    text: "text-amber-800 dark:text-amber-200",
  },
  truth: {
    bg: "bg-cyan-100 dark:bg-cyan-900",
    text: "text-cyan-800 dark:text-cyan-200",
  },
  salvation: {
    bg: "bg-red-100 dark:bg-red-900",
    text: "text-red-800 dark:text-red-200",
  },
  righteousness: {
    bg: "bg-yellow-100 dark:bg-yellow-900",
    text: "text-yellow-800 dark:text-yellow-200",
  },
  // Default for any other theme
  default: {
    bg: "bg-gray-100 dark:bg-gray-800",
    text: "text-gray-800 dark:text-gray-200",
  },
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

// Export ThemeChip for use in other components
export function ThemeChip({ theme }: { theme: string }) {
  const [isTooltipOpen, setIsTooltipOpen] = useState(false);
  const colors = getThemeColors(theme);
  const content = themeContent[theme.toLowerCase()] || {
    definition: "A key biblical concept",
    question: "How does this theme speak to you?",
  };

  return (
    <div className="relative inline-block">
      <button
        onClick={() => setIsTooltipOpen(true)}
        className={`px-3 py-1 rounded-full text-sm font-medium ${colors.bg} ${colors.text} cursor-pointer hover:opacity-90 transition-opacity`}
      >
        {theme}
      </button>

      {/* Tooltip/Modal */}
      {isTooltipOpen && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50"
          onClick={() => setIsTooltipOpen(false)}
        >
          <div className="fixed inset-0 bg-black opacity-30"></div>
          <div
            className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 max-w-sm w-full mx-4 z-50"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start mb-4">
              <h3 className={`text-xl font-semibold ${colors.text}`}>
                {theme}
              </h3>
              <button
                onClick={() => setIsTooltipOpen(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400"
              >
                ×
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Definition
                </h4>
                <p className="text-gray-900 dark:text-gray-100">
                  {content.definition}
                </p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Reflection Question
                </h4>
                <p className="text-gray-900 dark:text-gray-100">
                  {content.question}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ReadingPage() {
  const [verse, setVerse] = useState("");
  const [verseContent, setVerseContent] = useState("");
  const [commentary, setCommentary] = useState<Commentary | null>(null);
  const [answers, setAnswers] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [userId, setUserId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sharedReflections, setSharedReflections] = useState<Reflection[]>([]);
  const [showAllReflections, setShowAllReflections] = useState(false);
  const [isShared, setIsShared] = useState(true);
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

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
    const getUser = async () => {
      const urlUserId = searchParams.get("userId");
      if (urlUserId) {
        console.log("Using URL user ID:", urlUserId);
        setUserId(urlUserId);
      } else {
        console.error("No user found");
      }
    };
    getUser();
  }, [searchParams]);

  const handleVerseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!verse.trim() || !userId) return;

    setLoading(true);
    setError("");

    try {
      // Fetch verse from ESV API
      const verseResponse = await axios.post("/api/verse", { verse });
      const verseText = verseResponse.data.data.passages[0];
      setVerseContent(verseText);

      // Get AI commentary
      const commentaryResponse = await axios.post("/api/commentary", {
        verse,
        content: verseText,
      });
      setCommentary(commentaryResponse.data.data);
      setAnswers(
        new Array(commentaryResponse.data.data.questions.length).fill("")
      );

      // Save reading and themes to database
      await saveReading(userId, verse);

      // Save themes
      for (const theme of commentaryResponse.data.data.themes) {
        // First check if theme exists
        const { data: existingTheme } = await supabase
          .from("themes")
          .select("*")
          .eq("user_id", userId)
          .eq("name", theme)
          .single();

        if (existingTheme) {
          // Update count if theme exists
          const { error: updateError } = await supabase
            .from("themes")
            .update({ count: existingTheme.count + 1 })
            .eq("id", existingTheme.id);

          if (updateError) {
            console.error("Error updating theme count:", updateError);
          }
        } else {
          // Insert new theme if it doesn't exist
          const { error: insertError } = await supabase.from("themes").insert({
            user_id: userId,
            name: theme,
            count: 1,
          });

          if (insertError) {
            console.error("Error saving theme:", insertError);
          }
        }
      }
    } catch (error) {
      console.error("Error:", error);
      setError("Failed to fetch verse or generate commentary");
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = (index: number, value: string) => {
    if (!userId || !commentary) return;

    const newAnswers = [...answers];
    newAnswers[index] = value;
    setAnswers(newAnswers);
  };

  const handleSaveReflections = async () => {
    if (!userId) {
      setError("You must be logged in to save reflections");
      return;
    }

    if (!commentary || !verse) {
      setError("No verse or commentary data available");
      return;
    }

    setSaving(true);
    setError("");

    try {
      // Save all answers
      for (let i = 0; i < commentary.questions.length; i++) {
        if (answers[i]?.trim()) {
          try {
            console.log("Inserting reflection:", {
              user_id: userId,
              verse,
              question: commentary.questions[i],
              answer: answers[i],
              is_shared: isShared,
            });

            const { error: reflectionError } = await supabase
              .from("reflections")
              .insert({
                user_id: userId,
                verse: verse,
                question: commentary.questions[i],
                answer: answers[i],
                is_shared: isShared,
              });

            if (reflectionError) {
              console.error("Reflection error details:", reflectionError);
              throw reflectionError;
            }
          } catch (error: any) {
            console.error("Error saving reflection:", error);
            setError(`Failed to save reflection: ${error.message}`);
            setSaving(false);
            return;
          }
        }
      }
      setSaved(true);

      // Navigate to metrics page after a short delay
      setTimeout(() => {
        router.push(`/metrics?userId=${userId}`);
      }, 1500);
    } catch (error: any) {
      console.error("Error saving reflections:", error);
      setError(`Failed to save reflections: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  // Add verse selection handler for recommendations
  const handleVerseSelect = async (selectedVerse: string) => {
    setVerse(selectedVerse);
    if (!selectedVerse.trim() || !userId) return;

    setLoading(true);
    setError("");

    try {
      // Fetch verse from ESV API
      const verseResponse = await axios.post("/api/verse", {
        verse: selectedVerse,
      });
      const verseText = verseResponse.data.data.passages[0];
      setVerseContent(verseText);

      // Get AI commentary
      const commentaryResponse = await axios.post("/api/commentary", {
        verse: selectedVerse,
        content: verseText,
      });
      setCommentary(commentaryResponse.data.data);
      setAnswers(
        new Array(commentaryResponse.data.data.questions.length).fill("")
      );

      // Save reading and themes to database
      await saveReading(userId, selectedVerse);

      // Save themes
      for (const theme of commentaryResponse.data.data.themes) {
        // First check if theme exists
        const { data: existingTheme } = await supabase
          .from("themes")
          .select("*")
          .eq("user_id", userId)
          .eq("name", theme)
          .single();

        if (existingTheme) {
          // Update count if theme exists
          const { error: updateError } = await supabase
            .from("themes")
            .update({ count: existingTheme.count + 1 })
            .eq("id", existingTheme.id);

          if (updateError) {
            console.error("Error updating theme count:", updateError);
          }
        } else {
          // Insert new theme if it doesn't exist
          const { error: insertError } = await supabase.from("themes").insert({
            user_id: userId,
            name: theme,
            count: 1,
          });

          if (insertError) {
            console.error("Error saving theme:", insertError);
          }
        }
      }
    } catch (error) {
      console.error("Error:", error);
      setError("Failed to fetch verse or generate commentary");
    } finally {
      setLoading(false);
    }
  };

  if (!userId) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <NavigationHeader />
        <div className="p-4">
          <div className="max-w-4xl mx-auto">
            <p className="text-red-500">
              No user ID provided. Please return to the homepage.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <NavigationHeader />
      <div className="flex flex-col md:flex-row max-w-7xl mx-auto px-4 py-8 gap-8">
        {/* Main content */}
        <div className="flex-1">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Bible Reading
            </h1>
          </div>

          {/* Verse input form */}
          <form onSubmit={handleVerseSubmit} className="mb-8">
            <div className="space-y-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Enter Bible Verse (e.g., John 3:16)
              </label>
              <input
                type="text"
                value={verse}
                onChange={(e) => setVerse(e.target.value)}
                placeholder="Enter verse reference"
                className="w-full p-2 border border-gray-300 rounded-md bg-white dark:bg-gray-800 dark:border-gray-600"
              />
              <button
                type="submit"
                disabled={loading || !verse.trim()}
                className="w-full py-2 px-4 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50"
              >
                {loading ? "Loading..." : "Get Verse"}
              </button>
            </div>
          </form>

          {/* Verse content and commentary */}
          {verseContent && (
            <div className="mb-8 p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
              <p className="text-gray-900 dark:text-gray-100 font-serif">
                {verseContent}
              </p>
            </div>
          )}

          {commentary && (
            <div className="space-y-6">
              <div className="space-y-4">
                <h2 className="text-2xl font-semibold">Commentary</h2>
                <p className="text-gray-700 dark:text-gray-300">
                  {commentary.commentary}
                </p>

                <div className="space-y-2">
                  <h3 className="text-lg font-medium">Key Themes</h3>
                  <div className="flex flex-wrap gap-2">
                    {commentary.themes.map((theme, index) => (
                      <ThemeChip key={index} theme={theme} />
                    ))}
                  </div>
                </div>

                <h3 className="text-lg font-medium mt-4">Application</h3>
                <p className="text-gray-700 dark:text-gray-300">
                  {commentary.application}
                </p>
              </div>

              {/* Discussion questions section */}
              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Discussion Questions
                </h3>
                {commentary.questions.map((question, index) => (
                  <div key={index} className="space-y-2">
                    <p className="text-gray-700 dark:text-gray-300">
                      {index + 1}. {question}
                    </p>
                    <textarea
                      value={answers[index]}
                      onChange={(e) =>
                        handleAnswerChange(index, e.target.value)
                      }
                      placeholder="Type your answer here..."
                      className="w-full p-2 border border-gray-300 rounded-md bg-white dark:bg-gray-800 dark:border-gray-600"
                      rows={4}
                    />
                  </div>
                ))}

                {/* Sharing toggle */}
                <div className="flex items-center space-x-2 mt-4">
                  <input
                    type="checkbox"
                    id="sharing-toggle"
                    checked={isShared}
                    onChange={(e) => setIsShared(e.target.checked)}
                    className="h-4 w-4 text-blue-500 rounded border-gray-300 focus:ring-blue-500"
                  />
                  <label
                    htmlFor="sharing-toggle"
                    className="text-sm text-gray-700 dark:text-gray-300"
                  >
                    Share my reflections with the community
                  </label>
                </div>

                {/* Save button */}
                <div className="flex justify-end mt-6">
                  <button
                    onClick={handleSaveReflections}
                    disabled={saving || saved}
                    className={`px-6 py-2 rounded-md text-white ${
                      saving
                        ? "bg-gray-400"
                        : saved
                        ? "bg-green-500"
                        : "bg-blue-500 hover:bg-blue-600"
                    }`}
                  >
                    {saving
                      ? "Saving..."
                      : saved
                      ? "Saved!"
                      : "Save Reflections"}
                  </button>
                </div>

                {/* Error message */}
                {error && <p className="text-red-500 mt-2">{error}</p>}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div
          className={`w-full md:w-80 lg:w-96 ${
            sidebarOpen ? "fixed inset-0 z-50 md:relative" : "hidden md:block"
          }`}
        >
          <div className="h-full space-y-4">
            {/* Theme Recommendations */}
            {userId && (
              <ThemeRecommendations
                userId={userId}
                onVerseSelect={handleVerseSelect}
              />
            )}

            {/* Community Reflections */}
            <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Community Reflections
                </h2>
                <button
                  className="md:hidden"
                  onClick={() => setSidebarOpen(false)}
                >
                  <ChevronRightIcon className="h-6 w-6 text-gray-500" />
                </button>
              </div>

              <div className="space-y-4">
                {sharedReflections.map((reflection) => (
                  <div
                    key={reflection.id}
                    className="p-4 border rounded-lg mb-4 dark:border-gray-700"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {reflection.user?.name || "Anonymous"} •{" "}
                          {new Date(reflection.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    {reflection.themes && reflection.themes.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-2">
                        {reflection.themes.map((theme, index) => (
                          <ThemeChip key={index} theme={theme} />
                        ))}
                      </div>
                    )}

                    <p className="text-sm font-medium mb-1">
                      {reflection.question}
                    </p>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      {reflection.answer}
                    </p>
                  </div>
                ))}

                <button
                  onClick={() => setShowAllReflections(true)}
                  className="w-full py-2 text-blue-500 hover:text-blue-600 dark:text-blue-400 text-sm font-medium"
                >
                  View All Reflections
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile sidebar toggle */}
        <button
          className="fixed bottom-4 right-4 p-3 bg-blue-500 text-white rounded-full shadow-lg md:hidden"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          {sidebarOpen ? (
            <ChevronRightIcon className="h-6 w-6" />
          ) : (
            <ChevronLeftIcon className="h-6 w-6" />
          )}
        </button>

        {/* All reflections modal */}
        {showAllReflections && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] overflow-hidden">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    All Community Reflections
                  </h2>
                  <button
                    onClick={() => setShowAllReflections(false)}
                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  >
                    <span className="sr-only">Close</span>×
                  </button>
                </div>
              </div>
              <div className="p-4 overflow-y-auto">
                <div className="space-y-4">
                  {sharedReflections.map((reflection) => (
                    <div
                      key={reflection.id}
                      className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-medium text-gray-900 dark:text-white">
                          {reflection.user.name}
                        </span>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {new Date(reflection.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                        {reflection.verse}
                      </p>
                      <div className="flex flex-wrap gap-2 mb-2">
                        {reflection.themes.map((theme, index) => (
                          <ThemeChip key={index} theme={theme} />
                        ))}
                      </div>
                      <p className="text-sm font-medium text-gray-800 dark:text-gray-200 mb-1">
                        {reflection.question}
                      </p>
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        {reflection.answer}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
