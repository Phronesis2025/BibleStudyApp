"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { HeartIcon } from "@heroicons/react/24/solid";
import NavigationHeader from "@/components/NavigationHeader";
import { ThemeChip } from "@/components/ThemeChip";
import {
  initAnonymousSession,
  supabase,
  withTimeout,
} from "@/lib/supabaseClient";
import { logger } from "@/lib/logger";

interface Reflection {
  id: string;
  verse: string;
  verseText?: string;
  question: string;
  answer: string;
  insight?: string;
  createdAt: string;
  themes: string[];
  likes: number;
}

export default function ReflectionsPage() {
  const [reflections, setReflections] = useState<Reflection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAllShared = async () => {
      try {
        // Deep-link guard: shared reflections are only readable with a
        // session, so make sure this visitor has one (idempotent).
        await initAnonymousSession();

        const { data, error: fetchError } = await withTimeout(
          supabase
            .from("reflections")
            .select("*")
            .eq("is_shared", true)
            .order("created_at", { ascending: false }),
          10000,
          "Loading shared reflections"
        );

        if (fetchError) throw fetchError;

        setReflections(
          (data ?? []).map((r) => ({
            id: r.id,
            verse: r.verse,
            verseText: r.verse_text,
            question: r.question,
            answer: r.answer,
            insight: r.insight,
            createdAt: r.created_at,
            themes: Array.isArray(r.themes) ? r.themes : [],
            likes: r.likes || 0,
          }))
        );
      } catch (err) {
        logger.error("[Reflections page] failed to load:", err);
        setError("Failed to load reflections. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchAllShared();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-blue-900 pt-14 sm:pt-16">
      <NavigationHeader isAuthenticated={true} currentPage="reflections" />

      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-50 font-['Poppins']">
            Shared Reflections
          </h1>
          <Link
            href="/reading"
            className="text-sky-400 hover:text-sky-300 font-['Poppins'] text-sm sm:text-base"
          >
            ← Back to Reading
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="animate-pulse text-gray-400 font-['Poppins']">
              Loading reflections...
            </div>
          </div>
        ) : error ? (
          <p className="text-red-400 font-['Poppins']">{error}</p>
        ) : reflections.length === 0 ? (
          <p className="text-gray-400 italic font-['Poppins']">
            No shared reflections yet.
          </p>
        ) : (
          <div className="space-y-4">
            {reflections.map((reflection) => (
              <div
                key={reflection.id}
                className="p-4 sm:p-6 bg-blue-900/50 border border-sky-500/20 rounded-lg hover:bg-blue-900/70 transition-all"
              >
                <div className="flex flex-wrap gap-2">
                  {reflection.themes.map((theme, index) => (
                    <ThemeChip key={`${theme}-${index}`} theme={theme} />
                  ))}
                </div>
                {reflection.verseText && (
                  <p className="text-sm text-gray-200 font-semibold mt-3 font-['Poppins']">
                    {reflection.verse} – {reflection.verseText}
                  </p>
                )}
                <div className="mt-3">
                  <p className="text-sm text-gray-400 font-['Poppins']">
                    A user shared:
                  </p>
                  <p className="text-sm text-gray-300 mt-1 font-['Poppins'] leading-relaxed">
                    {reflection.insight || reflection.answer || ""}
                  </p>
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <span className="px-3 py-1 rounded-full text-sm font-semibold bg-gradient-to-r from-sky-400/20 to-blue-500/20 text-gray-200 flex items-center font-['Poppins']">
                    <HeartIcon className="h-4 w-4 text-sky-400 mr-1" />
                    {reflection.likes}
                  </span>
                  <span className="text-xs text-gray-500 font-['Poppins']">
                    {new Date(reflection.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
