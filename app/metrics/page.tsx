"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import NavigationHeader from "@/components/NavigationHeader";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { getThemes } from "@/actions/db";
import type { Theme } from "@/actions/db";

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export default function MetricsPage() {
  const [themes, setThemes] = useState<Theme[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const searchParams = useSearchParams();
  const userId = searchParams.get("userId");

  // Sample data - replace with actual data from your database
  const totalChapters = 1189; // Total chapters in the Bible
  const chaptersRead = 50; // Get this from your database
  const completionPercentage = (chaptersRead / totalChapters) * 100;

  useEffect(() => {
    const loadThemes = async () => {
      if (!userId) return;

      try {
        const themeData = await getThemes(userId);
        setThemes(themeData);
      } catch (error) {
        console.error("Failed to load themes:", error);
        setError("Failed to load theme data");
      } finally {
        setLoading(false);
      }
    };

    loadThemes();
  }, [userId]);

  const chartData = {
    labels: themes.map((theme) => theme.name),
    datasets: [
      {
        label: "Theme Frequency",
        data: themes.map((theme) => theme.count),
        backgroundColor: "rgba(59, 130, 246, 0.5)", // blue-500 with opacity
        borderColor: "rgb(59, 130, 246)", // blue-500
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: "Top Themes",
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
        },
      },
    },
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
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
          Reading Metrics
        </h1>

        {error && (
          <div className="mb-8 p-4 bg-red-100 text-red-500 rounded-md">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Progress Overview */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-6 text-gray-900 dark:text-white">
              Reading Progress
            </h2>
            <div className="w-48 h-48 mx-auto mb-4">
              <CircularProgressbar
                value={completionPercentage}
                text={`${completionPercentage.toFixed(1)}%`}
                styles={buildStyles({
                  pathColor: "#3B82F6",
                  textColor: "#3B82F6",
                  trailColor: "#E5E7EB",
                })}
              />
            </div>
            <div className="text-center">
              <p className="text-gray-600 dark:text-gray-300">
                {chaptersRead} of {totalChapters} chapters read
              </p>
            </div>
          </div>

          {/* Theme Analysis */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-6 text-gray-900 dark:text-white">
              Theme Analysis
            </h2>
            {loading ? (
              <div className="flex items-center justify-center h-48">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              </div>
            ) : themes.length > 0 ? (
              <Bar data={chartData} options={chartOptions} />
            ) : (
              <p className="text-gray-600 dark:text-gray-300 text-center">
                No theme data available yet.
              </p>
            )}
          </div>

          {/* Achievement Badges */}
          <div className="md:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-6 text-gray-900 dark:text-white">
              Achievements
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {/* Sample badges - replace with actual achievements */}
              <div className="p-4 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600">
                <p className="text-white text-center font-medium">
                  First Chapter
                </p>
              </div>
              <div className="p-4 rounded-lg bg-gradient-to-br from-green-500 to-teal-600">
                <p className="text-white text-center font-medium">
                  10 Chapters
                </p>
              </div>
              <div className="p-4 rounded-lg bg-gradient-to-br from-yellow-500 to-orange-600">
                <p className="text-white text-center font-medium">
                  50 Chapters
                </p>
              </div>
              <div className="p-4 rounded-lg bg-gradient-to-br from-red-500 to-pink-600">
                <p className="text-white text-center font-medium">
                  100 Chapters
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
