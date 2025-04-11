"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { BookOpenIcon, HeartIcon, HomeIcon } from "@heroicons/react/24/outline";
import { createBrowserClient } from "@supabase/ssr";
import { dailyVerses } from "@/data/verses";

export default function HomePage() {
  const [name, setName] = useState("");
  const [users, setUsers] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [tappedCard, setTappedCard] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalData, setModalData] = useState<any>(null);
  const [commentaryLoading, setCommentaryLoading] = useState(false);
  const [commentaryError, setCommentaryError] = useState("");
  const router = useRouter();
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // Load Poppins font
  useEffect(() => {
    const link = document.createElement("link");
    link.href =
      "https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;700&display=swap";
    link.rel = "stylesheet";
    document.head.appendChild(link);
    return () => {
      document.head.removeChild(link);
    };
  }, []);

  // Enable smooth scrolling
  useEffect(() => {
    document.documentElement.style.scrollBehavior = "smooth";
  }, []);

  const fetchUsers = useCallback(async () => {
    const { data, error: fetchError } = await supabase
      .from("users")
      .select("*");
    if (fetchError) {
      setError("Failed to fetch users");
      return;
    }
    setUsers(data || []);
  }, [supabase, setError, setUsers]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const getDayOfYear = (): number => {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 0);
    const diff: number = now.getTime() - start.getTime();
    const oneDay: number = 1000 * 60 * 60 * 24;
    return Math.floor(diff / oneDay);
  };

  const verseIndex = getDayOfYear() % dailyVerses.length;
  const verseOfTheDay = dailyVerses[verseIndex];

  const handleReadMore = async (verseReference: string, verseText: string) => {
    try {
      setCommentaryLoading(true);
      setCommentaryError("");

      const response = await fetch("/api/commentary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ verse: verseReference, content: verseText }),
      });

      if (!response.ok) {
        throw new Error(`API responded with status: ${response.status}`);
      }

      const data = await response.json();

      // Check if the API returned an error property
      if (data.error) {
        console.error("API error:", data.error);
        setCommentaryError("Could not load commentary: " + data.error);
        // Still use the data since we have fallbacks in the API
      }

      setModalData({
        reference: verseReference,
        text: verseText,
        generalMeaning: data.general_meaning || "No meaning available.",
        reflectiveQuestion:
          data.reflective_question || "How does this verse speak to you today?",
        error: data.error || "",
      });

      setIsModalOpen(true);
    } catch (error) {
      console.error("Error fetching commentary:", error);
      setCommentaryError("Failed to load commentary. Please try again later.");

      // Still show the modal with the verse but with error messaging
      setModalData({
        reference: verseReference,
        text: verseText,
        generalMeaning: "Commentary is currently unavailable.",
        reflectiveQuestion: "How does this verse speak to you today?",
        error: error instanceof Error ? error.message : "Unknown error",
      });

      setIsModalOpen(true);
    } finally {
      setCommentaryLoading(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Please enter a name");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const { data, error: createError } = await supabase
        .from("users")
        .insert([{ name: name.trim() }])
        .select()
        .single();

      if (createError) throw createError;

      setSuccess("User created successfully!");
      setName("");
      fetchUsers();
      router.push(`/reading?userId=${data.id}`);
    } catch (err) {
      // Log the error for debugging
      console.error("Error creating user:", err);
      setError("Failed to create user");
    } finally {
      setLoading(false);
    }
  };

  const handleUserSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const userId = e.target.value;
    if (userId) {
      router.push(`/reading?userId=${userId}`);
    }
  };

  const handleCardClick = (
    index: number,
    e: React.MouseEvent<HTMLDivElement>
  ) => {
    setTappedCard(tappedCard === index ? null : index);
    const ripple = document.createElement("span");
    ripple.className = "ripple";
    const rect = e.currentTarget.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    ripple.style.width = ripple.style.height = `${size}px`;
    ripple.style.left = `${e.clientX - rect.left - size / 2}px`;
    ripple.style.top = `${e.clientY - rect.top - size / 2}px`;
    e.currentTarget.appendChild(ripple);
    setTimeout(() => ripple.remove(), 600);
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-900">
      <style jsx global>{`
        [data-parallax] {
          background-attachment: fixed;
          background-position: center;
          background-size: cover;
        }
        @keyframes pop-bounce {
          0% {
            transform: scale(0.8);
            opacity: 0;
          }
          70% {
            transform: scale(1.05);
            opacity: 1;
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }
        .animate-pop-bounce {
          animation: pop-bounce 0.8s ease-out forwards;
        }
        .ripple {
          position: absolute;
          background: rgba(56, 189, 248, 0.3);
          border-radius: 50%;
          width: 10px;
          height: 10px;
          animation: ripple 0.6s linear;
          pointer-events: none;
        }
        @keyframes ripple {
          0% {
            transform: scale(0);
            opacity: 1;
          }
          100% {
            transform: scale(40);
            opacity: 0;
          }
        }
        @keyframes tap-rotate {
          0% {
            transform: rotate(0deg);
          }
          50% {
            transform: rotate(3deg);
          }
          100% {
            transform: rotate(0deg);
          }
        }
        .animate-tap-rotate {
          animation: tap-rotate 0.3s ease-in-out;
        }
      `}</style>

      {/* Hero Section */}
      <div className="relative py-16 bg-gradient-to-b from-gray-800 to-blue-900">
        <div
          data-parallax
          className="absolute inset-0"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1504052434569-70ad5836ab65?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80')",
          }}
        ></div>

        {/* Organic shapes */}
        <div className="absolute inset-0">
          <svg
            className="w-full h-full opacity-10"
            viewBox="0 0 1440 320"
            preserveAspectRatio="none"
          >
            <path
              fill="#38bdf8"
              fillOpacity="0.1"
              d="M0,128L48,144C96,160,192,192,288,186.7C384,181,480,139,576,128C672,117,768,139,864,165.3C960,192,1056,224,1152,213.3C1248,203,1344,149,1392,122.7L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
            />
          </svg>
        </div>

        <div className="absolute inset-0 bg-gray-900 opacity-70"></div>
        <div className="relative z-10 text-center max-w-4xl mx-auto px-4">
          <BookOpenIcon className="h-20 w-20 text-sky-400 mx-auto mb-4" />
          <h1
            className="text-6xl md:text-6xl font-bold font-['Poppins'] bg-gradient-to-r from-sky-400 to-blue-600 bg-clip-text text-transparent mb-4 animate-pop-bounce"
            style={{
              textShadow: "0 0 4px rgba(56, 189, 248, 0.3)",
            }}
          >
            Bible Study App
          </h1>
          <p className="text-gray-300 text-xl mt-2">
            Grow Closer to God with Every Verse You Read
          </p>
          <a
            href="#get-started"
            className="mt-4 inline-block px-6 py-3 bg-gradient-to-r from-sky-400 to-blue-500 text-white rounded-lg hover:from-sky-500 hover:to-blue-600 text-lg font-semibold transition-all opacity-90 hover:opacity-100 block mx-auto md:inline-block"
          >
            Start Your Journey
          </a>
        </div>
      </div>

      {/* Introduction Section */}
      <section className="py-12 px-4 max-w-6xl mx-auto animate-fade-in">
        <h2 className="text-3xl font-medium font-['Poppins'] text-gray-50 mb-4 text-center">
          Discover Deeper Insights
        </h2>
        <p className="text-gray-200 text-center mb-8">
          Discover the Bible's meaning with easy tools and thoughtful questions.
          Begin your journey with a profile today.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 animate-fade-in">
          <div
            onClick={(e) => handleCardClick(0, e)}
            className={
              tappedCard === 0
                ? "bg-blue-900/70 shadow-lg shadow-sky-400/30 p-6 md:p-8 rounded-lg text-center transition-colors animate-tap-rotate relative overflow-hidden"
                : "bg-blue-900/50 p-6 md:p-8 rounded-lg text-center transition-colors relative overflow-hidden"
            }
          >
            <span className="ripple"></span>
            <svg
              className="w-10 h-10 text-sky-400 mx-auto mb-3 hover:scale-110 transition-transform"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5s3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18s-3.332.477-4.5 1.253"
              ></path>
            </svg>
            <h3 className="text-xl font-medium text-sky-100 mb-2">
              Guided Commentary
            </h3>
            <p className="text-gray-300">
              Understand verses with historical context and application for
              today's world
            </p>
          </div>
          <div
            onClick={(e) => handleCardClick(1, e)}
            className={
              tappedCard === 1
                ? "bg-blue-900/70 shadow-lg shadow-sky-400/30 p-6 md:p-8 rounded-lg text-center transition-colors animate-tap-rotate relative overflow-hidden"
                : "bg-blue-900/50 p-6 md:p-8 rounded-lg text-center transition-colors relative overflow-hidden"
            }
          >
            <span className="ripple"></span>
            <svg
              className="w-10 h-10 text-sky-400 mx-auto mb-3 hover:scale-110 transition-transform"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a2 2 0 012-2h2a2 2 0 012 2v5m-4 0h4"
              ></path>
            </svg>
            <h3 className="text-lg font-medium text-gray-50 mb-2">
              Denominational Perspectives
            </h3>
            <p className="text-gray-200">
              Understand how different traditions interpret Scripture.
            </p>
          </div>
          <div
            onClick={(e) => handleCardClick(2, e)}
            className={
              tappedCard === 2
                ? "bg-blue-900/70 shadow-lg shadow-sky-400/30 p-6 md:p-8 rounded-lg text-center transition-colors animate-tap-rotate relative overflow-hidden"
                : "bg-blue-900/50 p-6 md:p-8 rounded-lg text-center transition-colors relative overflow-hidden"
            }
          >
            <span className="ripple"></span>
            <svg
              className="w-10 h-10 text-sky-400 mx-auto mb-3 hover:scale-110 transition-transform"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              ></path>
            </svg>
            <h3 className="text-lg font-medium text-gray-50 mb-2">
              Reflections
            </h3>
            <p className="text-gray-200">
              Deepen your faith with reflective questions and shared insights.
            </p>
          </div>
        </div>
      </section>

      {/* Verse of the Day Section */}
      <section className="py-8 px-4 max-w-6xl mx-auto">
        <h2 className="text-2xl font-medium font-['Poppins'] text-gray-50 mb-4 text-center">
          Verse of the Day
        </h2>
        <div className="bg-blue-900/30 border border-sky-500/20 p-6 rounded-lg text-center bg-gradient-radial from-sky-500/10 to-transparent">
          <p className="text-gray-200 italic">
            {verseOfTheDay.reference} – {verseOfTheDay.text}
          </p>
          <button
            onClick={() =>
              handleReadMore(verseOfTheDay.reference, verseOfTheDay.text)
            }
            className="text-sky-400 hover:text-sky-300 mt-4 inline-block hover:animate-bounce"
          >
            Read More →
          </button>
        </div>
      </section>

      {/* CTA Section */}
      <section id="get-started" className="py-12 px-4 max-w-md mx-auto">
        <h2 className="text-3xl font-medium font-['Poppins'] text-gray-50 mb-4 text-center">
          Get Started Today
        </h2>
        <p className="text-gray-200 text-center mb-6">
          Create a new user profile to start exploring Scripture, or select an
          existing user to continue your study.
        </p>

        <div className="space-y-4 animate-fade-in">
          {error && (
            <div className="text-red-400 bg-red-900 rounded p-2 text-center">
              {error}
            </div>
          )}
          {success && (
            <div className="text-green-400 bg-green-900 rounded p-2 text-center">
              {success}
            </div>
          )}
          <div className="p-6 bg-blue-900/50 bg-gradient-to-br from-blue-900 to-sky-900 rounded-lg shadow-md border border-gray-700 hover:bg-gray-700/50 transition card-with-lines">
            <form onSubmit={handleCreateUser} className="space-y-6">
              <div>
                <label
                  htmlFor="name"
                  className="block text-lg font-medium font-['Poppins'] text-gray-50 mb-2"
                >
                  Create New User
                </label>
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-3 border rounded bg-gray-700 text-white border-gray-600 text-lg focus:ring-2 focus:ring-sky-400 focus:outline-none"
                  placeholder="Enter your name"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full p-3 bg-gradient-to-r from-sky-500 to-blue-600 text-white rounded hover:from-sky-600 hover:to-blue-700 text-lg flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed focus:ring-2 focus:ring-sky-500 hover:animate-pulse"
              >
                {loading ? (
                  <>
                    <div className="animate-spin h-6 w-6 text-white mr-2">
                      <svg className="h-full w-full" viewBox="0 0 24 24">
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                    </div>
                    Creating...
                  </>
                ) : (
                  "Create User"
                )}
              </button>
            </form>

            <div className="mt-6">
              <label
                htmlFor="user-select"
                className="block text-lg font-medium font-['Poppins'] text-gray-50 mb-2"
              >
                Select Existing User (Go to Reading)
              </label>
              <select
                id="user-select"
                onChange={handleUserSelect}
                className="w-full p-3 border rounded bg-gray-700 text-white border-gray-600 text-lg focus:ring-2 focus:ring-sky-400 focus:outline-none"
              >
                <option value="">Choose a user...</option>
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-gray-700 py-4 text-center">
        <p className="text-sm text-gray-400">
          © 2025 Bible Study App | v1.0.12
        </p>
      </footer>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-blue-900/80 p-6 rounded-lg max-w-md mx-4 animate-fade-in">
            {commentaryLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin h-10 w-10 text-sky-400 mx-auto mb-4">
                  <svg className="h-full w-full" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                </div>
                <p className="text-gray-200">Loading commentary...</p>
              </div>
            ) : (
              <>
                <h3 className="text-xl font-medium text-gray-50 mb-2">
                  {modalData?.reference}
                </h3>
                <p className="text-gray-200 italic mb-4">{modalData?.text}</p>

                {commentaryError && (
                  <div className="bg-red-900/50 border border-red-500/50 p-3 rounded mb-4">
                    <p className="text-red-300 text-sm">{commentaryError}</p>
                  </div>
                )}

                <h4 className="text-lg font-medium text-gray-50 mb-2">
                  General Meaning
                </h4>
                <p className="text-gray-200 mb-4">
                  {modalData?.generalMeaning}
                </p>

                <h4 className="text-lg font-medium text-gray-50 mb-2">
                  Reflect
                </h4>
                <p className="text-gray-200 mb-4">
                  {modalData?.reflectiveQuestion}
                </p>

                <div className="flex justify-end">
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="text-gray-300 hover:text-gray-200 bg-blue-800/50 px-4 py-2 rounded hover:bg-blue-700/50 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
