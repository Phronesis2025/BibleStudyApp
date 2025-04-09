import { cookies } from "next/headers"; // To use server client
import { redirect } from "next/navigation"; // Server-side redirect
import Link from "next/link";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"; // Server client
import { ArrowLeftIcon, BookOpenIcon } from "@heroicons/react/24/outline";

// Define the expected shape of searchParams for clarity
interface MetricsPageProps {
  searchParams: { [key: string]: string | string[] | undefined };
}

// Component is now an async Server Component
export default async function MetricsPage({ searchParams }: MetricsPageProps) {
  const userId = searchParams?.userId;

  // --- Server-side Check and Redirect ---
  if (!userId || typeof userId !== "string") {
    console.log("Metrics Page (Server): No valid userId found, redirecting...");
    redirect("/");
  }
  // If we reach here, userId is valid

  // --- Server-side Data Fetching ---
  const supabase = createServerComponentClient({ cookies });
  let userName = "User"; // Default name
  let fetchError: string | null = null;

  try {
    const { data, error } = await supabase
      .from("users")
      .select("name")
      .eq("id", userId)
      .single();

    if (error) {
      // If user not found specifically, maybe redirect or show specific error
      if (error.code === "PGRST116") {
        console.error(
          `Metrics Page (Server): User not found for ID: ${userId}`
        );
        fetchError = `User with ID ${userId} not found.`;
        // Optional: redirect('/?error=userNotFound') instead of showing error page
      } else {
        throw error; // Re-throw other errors
      }
    } else if (data) {
      userName = data.name;
    }
  } catch (err: any) {
    console.error("Metrics Page (Server): Failed to fetch user data:", err);
    fetchError = "Failed to load user name.";
  }

  // --- Placeholder Data --- (Can be replaced with server-fetched stats later)
  const placeholderData = {
    dailyReading: [45, 30, 60, 20, 50, 40, 70],
    goal: 60,
    versesStudied: 12,
    reflectionsShared: 3,
  };
  const { dailyReading, goal, versesStudied, reflectionsShared } =
    placeholderData;
  const todayReading = dailyReading[dailyReading.length - 1];
  const weeklyAverage =
    dailyReading.reduce((a, b) => a + b, 0) / dailyReading.length;

  // --- Render Error State (Server-side decision) ---
  if (fetchError) {
    return (
      <div className="min-h-screen">
        {/* Static Navigation for error page */}
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
                href={`/reading?userId=${userId}`}
                className={`text-white hover:text-sky-400 transition text-lg font-semibold`}
              >
                Reading
              </Link>
              <span
                className={`text-sky-400 border-b-2 border-sky-400 pb-1 text-lg font-semibold`}
              >
                Metrics
              </span>{" "}
              {/* Indicate current page */}
            </div>
          </div>
        </nav>
        <div className="max-w-7xl mx-auto px-4 py-8 pt-20">
          <div className="p-6 bg-red-900/50 text-red-300 rounded-lg shadow-md border border-red-700">
            <p>Error: {fetchError}</p>
            <Link
              href={`/`}
              className="text-sky-400 hover:underline mt-4 inline-block"
            >
              Go back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // --- Main Render (Server Component) ---
  return (
    <div className="min-h-screen">
      {/* Navigation (Rendered Server Side - pathname prop needed if using client nav component) */}
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
              href={`/reading?userId=${userId}`}
              className={`text-white hover:text-sky-400 transition text-lg font-semibold`}
            >
              Reading
            </Link>
            {/* Highlight Metrics as active */}
            <span
              className={`text-sky-400 border-b-2 border-sky-400 pb-1 text-lg font-semibold`}
            >
              Metrics
            </span>
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <div className="flex flex-col gap-4 p-4 pt-20 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center">
          <BookOpenIcon className="h-8 w-8 text-sky-400 mr-2" />
          <h1 className="text-2xl font-bold text-white drop-shadow-md border-b-2 border-sky-400 w-auto mb-4">
            {userName}'s Reading Metrics
          </h1>
        </div>

        {/* Stats Card */}
        <div className="p-4 bg-gray-800/50 bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg shadow-md border border-gray-700 hover:bg-gray-700/50 transition card-with-lines">
          <h2 className="text-2xl font-bold text-white mb-2">Your Stats</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-3xl font-bold text-white">
                {todayReading} Minutes
              </p>
              <p className="text-sm text-gray-400">Read Today</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-white">
                {weeklyAverage.toFixed(1)} Minutes
              </p>
              <p className="text-sm text-gray-400">Weekly Average</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-white">{versesStudied}</p>
              <p className="text-sm text-gray-400">Verses Studied</p>
            </div>
          </div>
          {/* Visualization */}
          <div className="h-32 bg-gray-900/30 rounded-lg p-2 mt-4 relative overflow-hidden">
            <div
              className="absolute w-full top-1/2 border-t-2 border-dashed border-sky-400/50"
              style={{ transform: "translateY(-50%)", zIndex: 0 }}
            ></div>
            <div className="flex h-full items-end justify-around">
              {dailyReading.map((minutes, i) => (
                <div
                  key={i}
                  className="relative flex-1 h-full px-1 flex flex-col justify-end items-center"
                >
                  <div
                    className={`w-3/4 bg-sky-400 rounded-t transition-all duration-300 ${
                      i === dailyReading.length - 1 && minutes >= goal
                        ? "bg-green-400"
                        : ""
                    }`}
                    style={{
                      height: `${Math.min(
                        100,
                        (minutes / Math.max(...dailyReading, goal, 1)) * 100
                      )}%`,
                      zIndex: 1,
                    }}
                  />
                  <p className="text-xs text-gray-400 text-center mt-1">
                    {["S", "M", "T", "W", "T", "F", "S"][i]}
                  </p>
                </div>
              ))}
            </div>
          </div>
          <p className="text-sm text-gray-400 mt-2">Goal: {goal} Minutes/Day</p>
        </div>

        {/* Weekly Overview Card */}
        <div className="p-4 bg-gray-800/50 bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg shadow-md border border-gray-700 hover:bg-gray-700/50 transition card-with-lines">
          <h2 className="text-lg font-semibold text-white mb-2">
            Weekly Overview
          </h2>
          {dailyReading.map((minutes, i) => (
            <div
              key={i}
              className="flex justify-between text-sm text-gray-200 mb-1"
            >
              <p>
                {
                  [
                    "Sunday",
                    "Monday",
                    "Tuesday",
                    "Wednesday",
                    "Thursday",
                    "Friday",
                    "Saturday",
                  ][i]
                }
              </p>
              <p>{minutes} Minutes</p>
            </div>
          ))}
        </div>

        {/* Back to Reading Button */}
        <div className="mt-4">
          <Link
            href={`/reading?userId=${userId}`}
            className="inline-flex items-center p-2 bg-gradient-to-r from-sky-400 to-blue-500 text-white rounded hover:bg-sky-500 transition"
          >
            <ArrowLeftIcon className="h-5 w-5 mr-2" />
            Back to Reading
          </Link>
        </div>
      </div>
    </div>
  );
}
