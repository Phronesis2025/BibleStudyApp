"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import axios from "axios";
import { saveReading } from "@/actions/db";
import {
  HeartIcon,
  PlayIcon,
  PauseIcon,
  BookOpenIcon,
  ArrowUpIcon,
} from "@heroicons/react/24/solid";
import NavigationHeader from "@/components/NavigationHeader";
import CommentarySkeleton from "@/components/CommentarySkeleton";
import { ThemeChip } from "@/components/ThemeChip";
import { useAuth } from "@/context/AuthContext";
import {
  initAnonymousSession,
  supabase,
  withTimeout,
} from "@/lib/supabaseClient";
import { logger } from "@/lib/logger";

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

const suggestedVerses = [
  "John 3:16",
  "Psalm 23:1",
  "Romans 8:28",
  "Philippians 4:13",
  "Jeremiah 29:11",
  "Proverbs 3:5-6",
];

function ReadingPageMainContent() {
  const router = useRouter();
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
  const [isShared, setIsShared] = useState(true);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isUserIdChecked, setIsUserIdChecked] = useState(false);
  const [reflections, setReflections] = useState<Reflection[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showFullVerse, setShowFullVerse] = useState<Record<string, boolean>>(
    {}
  );
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

  const fetchReflections = useCallback(async () => {
      if (!userId) return;

      try {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const { data: reflectionsData, error } = await withTimeout(
          supabase
            .from("reflections")
            .select("*")
            .eq("is_shared", true)
            .gte("created_at", thirtyDaysAgo.toISOString())
            .order("created_at", { ascending: false }),
          10000,
          "Loading shared reflections"
        );

        logger.log("[Reflections] fetch result:", {
          count: reflectionsData?.length ?? null,
          error,
        });

        if (error) {
          console.error("Error fetching reflections:", error);
          return;
        }

        if (!reflectionsData) {
          logger.log("[Reflections] no reflections found");
          return;
        }

        const processedReflections = reflectionsData.map(
          (reflection) => {
            return {
              id: reflection.id,
              userId: reflection.user_id,
              verse: reflection.verse,
              verseText: reflection.verse_text,
              question: reflection.question,
              answer: reflection.answer,
              insight: reflection.insight,
              isShared: reflection.is_shared ?? false,
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
      } catch (error) {
        console.error("Error in fetchReflections:", error);
      }
  }, [userId]);

  useEffect(() => {
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
  }, [fetchReflections]);

  useEffect(() => {
    const setupUser = async () => {
      if (!session || !user) {
        if (authLoading) return;
        // Deep-link guard: start an anonymous session instead of bouncing to "/"
        try {
          await initAnonymousSession();
          // AuthContext onAuthStateChange will set session/user and re-run this effect
        } catch (err) {
          console.error("Reading page: Failed to start anonymous session:", err);
          router.push("/");
        }
        return;
      }

      if (authError) {
        console.error("Reading page: Auth error:", authError);
        router.push("/");
        return;
      }

      logger.log("Reading page: user confirmed, uid:", user.id);
      setUserId(user.id);

      try {
        // Timeout guard: this runs before the page renders content, so a
        // wedged request must fail fast rather than spin forever.
        const { error: selectError } = await withTimeout(
          supabase.from("users").select("id").eq("id", user.id).single(),
          10000,
          "User profile check"
        );

        if (selectError && selectError.code !== "PGRST116") {
          console.error(
            "Reading page: Error checking user in database:",
            selectError
          );

          if (selectError.message?.includes("does not exist")) {
            logger.log(
              "Reading page: user does not exist in database, creating entry"
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

      } catch (err) {
        console.error("Reading page: Error verifying user in database:", err);
      } finally {
        setIsUserIdChecked(true);
      }
    };

    setupUser();
  }, [session, user, authError, authLoading, router]);

  const handleVerseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!verse.trim()) {
      setMessage({ type: "error", text: "Please enter a verse reference (e.g., John 3:16)" });
      return;
    }

    logger.log("[Read] Starting for verse:", verse);
    setLoading(true);
    setMessage(null);
    setSaved(false);

    try {
      // Stage 1: fetch verse text
      logger.log("[Read] Stage 1: fetching verse text");
      let verseText = "";
      try {
        const verseResponse = await axios.post("/api/verse", { verse });
        if (!verseResponse.data.passages?.[0]) {
          throw new Error("Verse not found. Please check the reference format (e.g., John 3:16)");
        }
        verseText = verseResponse.data.passages[0];
        logger.log("[Read] Stage 1 done, text length:", verseText.length);
      } catch (err: unknown) {
        const msg = axios.isAxiosError(err)
          ? (err.response?.data?.error ?? err.message ?? "Verse not found")
          : err instanceof Error
          ? err.message
          : "Failed to fetch verse";
        console.error("[Read] Stage 1 failed:", msg);
        setMessage({ type: "error", text: msg });
        return;
      }
      setVerseContent(verseText);

      // Stage 2: log reading — non-fatal, DB failure must not block verse display
      if (userId) {
        logger.log("[Read] Stage 2: logging reading to DB");
        try {
          await saveReading(userId, verse);
          logger.log("[Read] Stage 2 done");
        } catch (err) {
          console.error("[Read] Stage 2 failed (non-fatal, continuing):", err);
        }
      }

      // Stage 3: fetch commentary
      logger.log("[Read] Stage 3: fetching commentary");
      let data: Record<string, unknown> = {};
      try {
        const commentaryResponse = await axios.post("/api/commentary", {
          verse,
          content: verseText,
        });
        if (!commentaryResponse.data) {
          throw new Error("No commentary received");
        }
        data = commentaryResponse.data;
        logger.log("[Read] Stage 3 done");
      } catch (err: unknown) {
        const msg = axios.isAxiosError(err)
          ? (err.response?.data?.error ?? err.message ?? "Failed to generate commentary")
          : err instanceof Error
          ? err.message
          : "Failed to generate commentary";
        console.error("[Read] Stage 3 failed:", msg);
        setMessage({ type: "error", text: msg });
        return;
      }

      // Stage 4: render commentary — nullish defaults prevent render crashes
      logger.log("[Read] Stage 4: setting commentary state");
      setCommentary({
        historical_context: (data.historical_context as string) ?? "",
        general_meaning: (data.general_meaning as string) ?? "",
        commentary: (data.reading_it_right as Commentary["commentary"]) ?? {
          summarize: "",
          expose: "",
          change: "",
          prepare: "",
        },
        application: (data.application as string) ?? "",
        denominational_perspectives:
          (data.denominational_perspectives as Commentary["denominational_perspectives"]) ?? {
            protestant: "",
            baptist: "",
            catholic: "",
          },
        themes: Array.isArray(data.themes) ? (data.themes as string[]) : [],
        reflective_question: (data.reflective_question as string) ?? "",
      });
      setMessage(null);
      logger.log("[Read] Complete");
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
    // [Save] Pre-flight guards
    if (!userId) {
      setMessage({ type: "error", text: "You must be logged in to save reflections" });
      return;
    }
    if (!commentary || !verse) {
      setMessage({ type: "error", text: "No verse or commentary data available" });
      return;
    }
    if (!answer?.trim()) {
      setMessage({ type: "error", text: "Please provide an answer to the reflection question" });
      return;
    }

    setSaving(true);
    setMessage(null);

    try {
      // [Save] Stage 1: verify session is alive and get a fresh token
      logger.log("[Save] Stage 1: verifying session");
      const { data: { session: liveSession }, error: sessionError } =
        await withTimeout(supabase.auth.getSession(), 5000, "Session check");
      if (sessionError) {
        console.error("[Save] Stage 1 session error:", sessionError.message);
        throw new Error(`Session error: ${sessionError.message}`);
      }
      if (!liveSession) {
        console.error("[Save] Stage 1: no active session");
        throw new Error("Your session has expired. Please sign in again.");
      }
      logger.log("[Save] Stage 1 done, uid:", liveSession.user.id);

      // [Save] Stage 2: build payload and insert
      const reflectionPayload = {
        user_id: userId,
        verse,
        verse_text: verseContent,
        question: commentary.reflective_question,
        answer: answer.trim(),
        insight: insight.trim(),
        is_shared: isShared,
        themes: commentary.themes,
      };
      logger.log("[Save] Stage 2: inserting reflection");

      const { data: savedReflection, error: reflectionError } =
        await withTimeout(
          supabase
            .from("reflections")
            .insert(reflectionPayload)
            .select()
            .single(),
          10000,
          "Saving reflection"
        );

      if (reflectionError) {
        console.error("[Save] Stage 2 Supabase error:", {
          message: reflectionError.message,
          details: reflectionError.details,
          hint: reflectionError.hint,
          code: reflectionError.code,
        });
        throw new Error(`Failed to save: ${reflectionError.message}`);
      }
      if (!savedReflection) {
        throw new Error("No data returned after insert");
      }
      logger.log("[Save] Stage 2 done, id:", savedReflection.id);

      // [Save] Stage 3: success — show message, refresh the shared panel,
      // then reset the form
      logger.log("[Save] Complete");
      setMessage({ type: "success", text: "Reflection saved! ✓" });
      setSaved(true);
      fetchReflections();

      setTimeout(() => {
        setVerse("");
        setVerseContent("");
        setCommentary(null);
        setAnswer("");
        setInsight("");
        setIsShared(true);
        setSaved(false);
      }, 1500);
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : String(error);
      console.error("[Save] Error:", msg);
      setMessage({ type: "error", text: msg });
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

    logger.log("[Like] toggling", reflectionId, "like:", pLike);

    try {
      const { data, error } = await withTimeout(
        supabase.rpc("toggle_like", {
          p_reflection_id: reflectionId,
          p_user_id: user.id,
          p_like: pLike,
        }),
        10000,
        "Updating like"
      );

      if (error) throw error;

      logger.log("[Like] updated likes:", data?.likes);

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
      const details = err as {
        code?: string;
        details?: string;
        hint?: string;
        status?: number;
      };
      console.error("Error toggling like:", {
        message: err instanceof Error ? err.message : String(err),
        code: details?.code,
        details: details?.details,
        hint: details?.hint,
        status: details?.status,
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
                <div className="space-y-4">
                  <div className="bg-blue-950/40 border border-sky-500/10 rounded-lg p-5">
                    <h3 className="text-sky-400 text-xs font-semibold uppercase tracking-widest font-['Poppins'] mb-3">
                      Historical Context
                    </h3>
                    <p className="text-gray-200 font-['Poppins'] leading-relaxed max-w-prose">
                      {commentary.historical_context}
                    </p>
                  </div>
                  <div className="bg-blue-950/40 border border-sky-500/10 rounded-lg p-5">
                    <h3 className="text-sky-400 text-xs font-semibold uppercase tracking-widest font-['Poppins'] mb-3">
                      General Meaning
                    </h3>
                    <p className="text-gray-200 font-['Poppins'] leading-relaxed max-w-prose">
                      {commentary.general_meaning}
                    </p>
                  </div>
                  <div className="bg-blue-950/40 border border-sky-500/10 rounded-lg p-5">
                    <h3 className="text-sky-400 text-xs font-semibold uppercase tracking-widest font-['Poppins'] mb-4">
                      Reading it Right
                    </h3>
                    <div className="space-y-5 font-['Poppins']">
                      {[
                        { label: "Summarize", text: commentary.commentary.summarize },
                        { label: "Expose", text: commentary.commentary.expose },
                        { label: "Change", text: commentary.commentary.change },
                        { label: "Prepare", text: commentary.commentary.prepare },
                      ].map(({ label, text }) => (
                        <div key={label} className="border-l-2 border-sky-500/30 pl-4">
                          <h4 className="text-gray-100 font-semibold text-sm mb-1">{label}</h4>
                          <p className="text-gray-300 leading-relaxed max-w-prose">{text}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="bg-blue-950/40 border border-sky-500/10 rounded-lg p-5">
                    <h3 className="text-sky-400 text-xs font-semibold uppercase tracking-widest font-['Poppins'] mb-3">
                      Application
                    </h3>
                    <p className="text-gray-200 font-['Poppins'] leading-relaxed max-w-prose">
                      {commentary.application}
                    </p>
                  </div>
                  <div className="bg-blue-950/40 border border-sky-500/10 rounded-lg p-5">
                    <h3 className="text-sky-400 text-xs font-semibold uppercase tracking-widest font-['Poppins'] mb-4">
                      Denominational Perspectives
                    </h3>
                    <div className="space-y-5 font-['Poppins']">
                      {[
                        { label: "Protestant", text: commentary.denominational_perspectives.protestant },
                        { label: "Baptist", text: commentary.denominational_perspectives.baptist },
                        { label: "Catholic", text: commentary.denominational_perspectives.catholic },
                      ].map(({ label, text }) => (
                        <div key={label} className="border-l-2 border-sky-500/30 pl-4">
                          <h4 className="text-gray-100 font-semibold text-sm mb-1">{label}</h4>
                          <p className="text-gray-300 leading-relaxed max-w-prose">{text}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="mt-4 bg-blue-950/40 border border-sky-500/10 rounded-lg p-5">
                  <h3 className="text-sky-400 text-xs font-semibold uppercase tracking-widest font-['Poppins'] mb-3">
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
                  <div className="flex items-center gap-3 flex-wrap">
                    <button
                      onClick={handleSaveReflections}
                      disabled={saving || !isAnswerValid || saved}
                      className="bg-gradient-to-r from-sky-400 to-blue-500 text-white px-5 py-2 rounded-lg hover:from-sky-500 hover:to-blue-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-['Poppins'] flex items-center gap-2"
                    >
                      {saving && (
                        <span className="inline-block h-4 w-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                      )}
                      {saving ? "Saving…" : saved ? "Saved ✓" : "Save Reflection"}
                    </button>
                    {message && (
                      <p
                        className={`text-sm font-['Poppins'] ${
                          message.type === "error" ? "text-red-400" : "text-green-400"
                        }`}
                      >
                        {message.text}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )
        )}

        <div className="mt-8 bg-blue-900/30 border border-sky-500/20 p-6 rounded-lg shadow-lg shadow-sky-400/10">
          <h2 className="text-xl font-medium font-['Poppins'] text-gray-50 mb-4">
            Shared Reflections
          </h2>
          {reflections.length > 0 ? (
            <div className="relative">
              <div
                className={`transition-opacity duration-500 ${
                  isTransitioning ? "opacity-0" : "opacity-100"
                }`}
              >
                <div className="p-4 bg-blue-900/50 border border-sky-500/20 rounded-lg hover:bg-blue-900/70 transition-all">
                  <div className="flex flex-wrap gap-2">
                    {reflections[currentIndex]?.themes ? (
                      reflections[currentIndex]?.themes.map((theme, index) => (
                        <ThemeChip key={`${theme}-${index}`} theme={theme} />
                      ))
                    ) : (
                      <>
                        <ThemeChip theme="faith" />
                        <ThemeChip theme="love" />
                        <ThemeChip theme="hope" />
                      </>
                    )}
                  </div>
                  {reflections[currentIndex]?.verseText && (
                    <p className="text-sm text-gray-200 font-semibold mt-3 font-['Poppins']">
                      {reflections[currentIndex].verse} –{" "}
                      {showFullVerse[reflections[currentIndex].id]
                        ? reflections[currentIndex].verseText
                        : reflections[currentIndex].verseText.slice(0, 80) +
                          (reflections[currentIndex].verseText.length > 80
                            ? "..."
                            : "")}
                      {reflections[currentIndex].verseText.length > 80 && (
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
                  <div className="mt-3">
                    <p className="text-sm text-gray-400 font-['Poppins']">
                      A user shared:
                    </p>
                    <p className="text-sm text-gray-300 mt-1 font-['Poppins'] leading-relaxed">
                      {reflections[currentIndex].insight ||
                        reflections[currentIndex].answer ||
                        ""}
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
              <div className="mt-5 space-y-3">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="flex-shrink-0 p-1 text-sky-400 hover:text-blue-400 transition-colors"
                    aria-label={isPlaying ? "Pause" : "Play"}
                  >
                    {isPlaying ? (
                      <PauseIcon className="h-5 w-5" />
                    ) : (
                      <PlayIcon className="h-5 w-5" />
                    )}
                  </button>
                  <div className="flex-1 h-1 bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-sky-400 transition-all duration-500"
                      style={{
                        width: `${((currentIndex + 1) / reflections.length) * 100}%`,
                      }}
                    />
                  </div>
                  <span className="flex-shrink-0 text-xs text-gray-400 font-['Poppins'] tabular-nums">
                    {currentIndex + 1}/{reflections.length}
                  </span>
                </div>
                <div className="flex gap-2 justify-center flex-wrap">
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
                          : "bg-gray-600 hover:bg-gray-400"
                      }`}
                      aria-label={`Go to reflection ${index + 1}`}
                    />
                  ))}
                </div>
              </div>
              <Link
                href="/reflections"
                className="text-sky-400 hover:text-sky-300 mt-5 text-center block font-['Poppins'] text-sm sm:text-base"
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
  const { session, loading: authLoading } = useAuth();

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
