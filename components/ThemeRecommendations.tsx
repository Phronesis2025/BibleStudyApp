import { useState, useEffect } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { ThemeChip } from "@/app/reading/page"; // We'll need to export this from the reading page

interface Recommendation {
  theme: string;
  verse: string;
  description: string;
}

interface Props {
  userId: string;
  onVerseSelect: (verse: string) => void;
}

export default function ThemeRecommendations({ userId, onVerseSelect }: Props) {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    async function fetchRecommendations() {
      try {
        // First, get user's top themes
        const { data: topThemes, error: themesError } = await supabase
          .from("themes")
          .select("name, count")
          .eq("user_id", userId)
          .order("count", { ascending: false })
          .limit(3);

        if (themesError) throw themesError;

        if (!topThemes?.length) {
          setRecommendations([]);
          setLoading(false);
          return;
        }

        // Get recommendations for top themes
        const { data: recommendations, error: recsError } = await supabase
          .from("theme_recommendations")
          .select("theme, verse, description")
          .in(
            "theme",
            topThemes.map((t) => t.name)
          )
          .limit(3);

        if (recsError) throw recsError;

        // If we have recommendations, randomly select one per theme
        const uniqueRecs = topThemes
          .map((theme) => {
            const themeRecs = recommendations?.filter(
              (r) => r.theme === theme.name
            );
            return themeRecs?.length
              ? themeRecs[Math.floor(Math.random() * themeRecs.length)]
              : null;
          })
          .filter((r): r is Recommendation => r !== null);

        setRecommendations(uniqueRecs);
      } catch (error) {
        console.error("Error fetching recommendations:", error);
        setError("Failed to load recommendations");
      } finally {
        setLoading(false);
      }
    }

    fetchRecommendations();
  }, [userId, supabase]);

  if (loading) {
    return (
      <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow animate-pulse">
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4"></div>
        <div className="space-y-3">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  if (!recommendations.length) {
    return null;
  }

  return (
    <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
        Recommended Readings
      </h2>
      <div className="space-y-4">
        {recommendations.map((rec, index) => (
          <div
            key={index}
            className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors"
          >
            <div className="flex items-center gap-2 mb-2">
              <ThemeChip theme={rec.theme} />
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
              {rec.description}
            </p>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {rec.verse}
              </span>
              <button
                onClick={() => onVerseSelect(rec.verse)}
                className="px-3 py-1 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium"
              >
                Read Now →
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
