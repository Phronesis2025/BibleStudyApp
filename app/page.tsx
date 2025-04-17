"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { BookOpenIcon, HeartIcon, HomeIcon } from "@heroicons/react/24/outline";
import { dailyVerses } from "@/data/verses";
import NavigationHeader from "@/components/NavigationHeader";
import SignInModal from "@/components/SignInModal";
import { useAuth } from "@/context/AuthContext";

export default function HomePage() {
  const router = useRouter();
  const { session, user, loading: authLoading } = useAuth();
  const [tappedCard, setTappedCard] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalData, setModalData] = useState<any>(null);
  const [commentaryLoading, setCommentaryLoading] = useState(false);
  const [commentaryError, setCommentaryError] = useState("");
  const [isSignupModalOpen, setIsSignupModalOpen] = useState(false);
  const [signInMode, setSignInMode] = useState<"signup" | "signin">("signup");
  const [imageError, setImageError] = useState(false);

  // Redirect to reading page if user is authenticated
  useEffect(() => {
    if (session && user) {
      router.push(`/reading?userId=${user.id}`);
    }
  }, [session, user, router]);

  // If still loading auth state or user is authenticated, show minimal content
  if (authLoading || session) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="animate-pulse flex flex-col items-center">
          <BookOpenIcon className="h-12 w-12 text-sky-400 mb-4" />
          <p className="text-gray-300">Loading your experience...</p>
        </div>
      </div>
    );
  }

  // Smooth scroll handler for "Start your Journey" button
  const handleScrollToGetStarted = () => {
    const getStartedSection = document.getElementById("get-started");
    if (getStartedSection) {
      const offset = 64; // Adjust for fixed nav height
      const elementPosition =
        getStartedSection.getBoundingClientRect().top + window.pageYOffset;
      window.scrollTo({
        top: elementPosition - offset,
        behavior: "smooth",
      });
    }
  };

  const getDayOfYear = (): number => {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 0);
    const diff = now.getTime() - start.getTime();
    const oneDay = 1000 * 60 * 60 * 24;
    return Math.floor(diff / oneDay);
  };

  const handleReadMore = async (verseReference: string, verseText: string) => {
    setIsModalOpen(true);
    setModalData({
      reference: verseReference,
      text: verseText,
      commentary: null,
    });
    setCommentaryLoading(true);
    setCommentaryError("");

    try {
      const response = await fetch("/api/commentary", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          reference: verseReference,
          text: verseText,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch commentary");
      }

      setModalData({
        reference: verseReference,
        text: verseText,
        commentary: data.commentary,
      });
    } catch (err: any) {
      console.error("Error fetching commentary:", err);
      setCommentaryError(
        err.message || "Failed to load commentary. Please try again."
      );
    } finally {
      setCommentaryLoading(false);
    }
  };

  const handleCardClick = (
    index: number,
    e: React.MouseEvent<HTMLDivElement>
  ) => {
    if (tappedCard === index) {
      setTappedCard(null);
    } else {
      setTappedCard(index);
    }
  };

  // Get today's verse from the dailyVerses array
  const today = getDayOfYear() % dailyVerses.length;
  const todayVerse = dailyVerses[today];

  return (
    <div className="flex flex-col min-h-screen bg-gray-900 pt-14 sm:pt-16">
      <NavigationHeader
        isAuthenticated={false} // We know user is not authenticated at this point
        setIsSignupModalOpen={setIsSignupModalOpen}
        setMode={setSignInMode}
        currentPage="home"
      />

      {/* Hero Section */}
      <section className="relative flex-grow flex flex-col items-center justify-center text-white px-4 py-16 md:py-24 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 font-['Poppins'] tracking-tight">
            Grow closer to God with every verse you read
          </h1>
          <p className="text-lg md:text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Explore the Bible with our modern, verse-by-verse study companion
            with AI-powered commentary to deepen your understanding.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={handleScrollToGetStarted}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-sky-400 rounded-lg font-medium text-white shadow-lg hover:from-blue-700 hover:to-sky-500 transition duration-300 flex items-center gap-2"
            >
              <BookOpenIcon className="h-5 w-5" />
              Start Your Journey
            </button>
          </div>
        </div>
      </section>

      {/* Feature Cards */}
      <section
        id="get-started"
        className="py-12 px-4 max-w-6xl mx-auto animate-fade-in"
      >
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

        {/* Sign in CTA */}
        <div className="mt-12 bg-blue-900/30 p-6 rounded-lg text-center">
          <h3 className="text-xl font-medium text-sky-100 mb-3">
            Ready to begin your journey?
          </h3>
          <p className="text-gray-300 mb-6">
            Create an account to save your insights and track your progress
          </p>
          <button
            onClick={() => {
              setSignInMode("signup");
              setIsSignupModalOpen(true);
            }}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-sky-400 rounded-lg font-medium text-white shadow-lg hover:from-blue-700 hover:to-sky-500 transition duration-300"
          >
            Create Free Account
          </button>
        </div>
      </section>

      {/* Auth modal */}
      {isSignupModalOpen && (
        <SignInModal
          isOpen={isSignupModalOpen}
          onClose={() => setIsSignupModalOpen(false)}
          initialMode={signInMode}
        />
      )}
    </div>
  );
}
