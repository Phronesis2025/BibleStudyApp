"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { BookOpenIcon, HeartIcon, HomeIcon } from "@heroicons/react/24/outline";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { dailyVerses } from "@/data/verses";
import type { Session, User } from "@supabase/supabase-js";
import NavigationHeader from "@/components/NavigationHeader";

export default function HomePage() {
  const router = useRouter();
  const supabase = createClientComponentClient();
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
  const [isSignupModalOpen, setIsSignupModalOpen] = useState(false);
  const [mode, setMode] = useState<"signup" | "signin">("signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [userSession, setUserSession] = useState<Session | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [sessionError, setSessionError] = useState<string | null>(null);
  const [imageError, setImageError] = useState(false);

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

  useEffect(() => {
    const checkSession = async () => {
      console.log("Checking session on page load...");
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (error) {
          console.error("Session check error:", error);
          setSessionError("Failed to load session. Please try again.");
          if (
            error.message.includes("JWT") ||
            error.message.includes("does not exist")
          ) {
            console.log("Invalid token detected, signing out...");
            await supabase.auth.signOut();
            setUserSession(null);
            setCurrentUser(null);
            router.refresh();
          }
          return;
        }

        if (session) {
          console.log("Session detected on load:", session);
          try {
            const {
              data: { user },
              error: userError,
            } = await supabase.auth.getUser();

            if (userError) {
              console.error("Error getting user on load:", userError);
              setSessionError("Failed to load user. Please try again.");
              if (
                userError.message.includes("JWT") ||
                userError.message.includes("does not exist")
              ) {
                console.log("Invalid user token detected, signing out...");
                await supabase.auth.signOut();
                setUserSession(null);
                setCurrentUser(null);
                router.refresh();
              }
              return;
            }

            if (user) {
              console.log("User detected on load:", user);
              try {
                const { data: existingUser, error: selectError } =
                  await supabase
                    .from("users")
                    .select("id")
                    .eq("id", user.id)
                    .single();

                if (selectError && selectError.code !== "PGRST116") {
                  console.error(
                    "Error checking user in database:",
                    selectError
                  );
                  if (selectError.message.includes("does not exist")) {
                    console.log(
                      "User does not exist in database, signing out..."
                    );
                    await supabase.auth.signOut();
                    setUserSession(null);
                    setCurrentUser(null);
                    router.refresh();
                    return;
                  }
                }

                setCurrentUser(user);
                setUserSession(session);
                router.push(`/reading?userId=${user.id}`);
              } catch (err) {
                console.error("Error verifying user in database:", err);
                setSessionError("Failed to verify user. Please try again.");
              }
            } else {
              console.log("No user found for session, signing out...");
              await supabase.auth.signOut();
              setUserSession(null);
              setCurrentUser(null);
              router.refresh();
            }
          } catch (userErr) {
            console.error("Unexpected error getting user:", userErr);
            await supabase.auth.signOut();
            setUserSession(null);
            setCurrentUser(null);
            router.refresh();
          }
        } else {
          console.log("No active session found on load");
        }
      } catch (error) {
        console.error("Unexpected error checking session:", error);
        setSessionError("An unexpected error occurred. Please try again.");
        await supabase.auth.signOut();
        setUserSession(null);
        setCurrentUser(null);
        router.refresh();
      }
    };

    checkSession();
  }, [router, supabase]);

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === "SIGNED_IN" && session) {
          console.log("Auth state changed: SIGNED_IN", session);
          setUserSession(session);
          supabase.auth.getUser().then(({ data: { user } }) => {
            if (user) {
              setCurrentUser(user);
              setTimeout(() => {
                router.push(`/reading?userId=${user.id}`);
              }, 1000);
            }
          });
        }
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [router, supabase]);

  useEffect(() => {
    setError(""); // Clear error when switching modes
  }, [mode]);

  useEffect(() => {
    setSessionError(null); // Clear session error when switching modes
  }, [mode]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Starting handleAuth...");
    setError("");
    setSuccess("");
    setLoading(true);

    if (!email || !password) {
      setError("Please fill in all fields");
      setLoading(false);
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address");
      setLoading(false);
      return;
    }

    // Password validation for signup
    if (mode === "signup") {
      if (password !== confirmPassword) {
        setError("Passwords do not match");
        setLoading(false);
        return;
      }

      if (password.length < 8) {
        setError("Password must be at least 8 characters");
        setLoading(false);
        return;
      }
    }

    try {
      if (mode === "signup") {
        await supabase.auth.signOut();
        setUserSession(null);
        setCurrentUser(null);

        console.log("Attempting signup with email:", email);
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
        });

        if (signUpError) {
          console.error("Sign-up error:", signUpError);
          if (signUpError.message.includes("User already registered")) {
            setError(
              "This email is already registered. Please sign in instead."
            );
            setLoading(false);
            return;
          }
          setError(
            signUpError.message || "Failed to sign up. Please try again."
          );
          setLoading(false);
          return;
        }

        console.log("Signup successful:", data);

        if (!data.user) {
          throw new Error("No user created during signup");
        }

        const { data: existingUsers, error: fetchError } = await supabase
          .from("users")
          .select("*")
          .eq("id", data.user.id);

        if (fetchError) {
          console.error("Error checking existing user:", fetchError);
          throw fetchError;
        }

        if (!existingUsers || existingUsers.length === 0) {
          const defaultName = data.user.email
            ? data.user.email.split("@")[0]
            : "Anonymous";

          const { error: insertError } = await supabase.from("users").insert([
            {
              id: data.user.id,
              name: defaultName,
              email: data.user.email || "",
              created_at: new Date().toISOString(),
            },
          ]);

          if (insertError) {
            console.error("Error inserting user:", insertError);
            throw insertError;
          }

          console.log(
            "Created new user in database with default name:",
            defaultName
          );
        }

        console.log("Signing in after signup to establish session");
        const { data: signInData, error: signInError } =
          await supabase.auth.signInWithPassword({
            email,
            password,
          });

        if (signInError) {
          console.error("Sign-in after signup error:", signInError);
          setError("Failed to sign in after signup. Please try again.");
          setLoading(false);
          return;
        }

        if (!signInData.user || !signInData.session) {
          throw new Error("Sign-in successful but no user or session returned");
        }

        setSuccess(
          "Signup successful! Please check your email to verify your account."
        );
        setIsSignupModalOpen(false);
      } else {
        console.log("Attempting signin with email:", email);
        const { data, error: signInError } =
          await supabase.auth.signInWithPassword({
            email,
            password,
          });

        if (signInError) {
          console.error("Sign-in error:", signInError);
          setError("Invalid email or password. Please try again.");
          setLoading(false);
          return;
        }

        if (!data.user || !data.session) {
          throw new Error("Sign-in successful but no user or session returned");
        }

        setSuccess("Login successful!");
        setIsSignupModalOpen(false);
      }
    } catch (error: any) {
      console.error("Authentication error:", error);
      setError(error.message || "An error occurred during authentication");
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = useCallback(async () => {
    const { data, error: fetchError } = await supabase
      .from("users")
      .select("*");
    if (fetchError) {
      setError("Failed to fetch users");
      console.error("Fetch users error:", fetchError);
      return;
    }
    setUsers(data || []);
    console.log("Users fetched:", data);
  }, [supabase]);

  const handleGoogleLogin = async () => {
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: window.location.origin,
        },
      });

      if (error) {
        console.error("Google sign-in error:", error);
        setError(
          error.message || "Failed to sign in with Google. Please try again."
        );
        setLoading(false);
        return;
      }

      console.log("Google sign-in initiated:", data);
    } catch (error: any) {
      console.error("Google authentication error:", error);
      setError(
        error.message || "An error occurred during Google authentication"
      );
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

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

  useEffect(() => {
    document.documentElement.style.scrollBehavior = "smooth";
  }, []);

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

      if (data.error) {
        console.error("API error:", data.error);
        setCommentaryError("Could not load commentary: " + data.error);
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

  if (sessionError) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center text-red-400">
          <p>{sessionError}</p>
          <button
            onClick={() => router.refresh()}
            className="text-sky-400 hover:underline mt-4"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-900 pt-14 sm:pt-16">
      <NavigationHeader
        isAuthenticated={false}
        setIsSignupModalOpen={setIsSignupModalOpen}
        setMode={setMode}
        currentPage="home"
      />
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

      <div className="relative py-16 bg-gradient-to-b from-gray-800 to-blue-900">
        <div
          data-parallax
          className="absolute inset-0"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1504052434569-70ad5836ab65?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80')",
          }}
        ></div>

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
          <button
            onClick={handleScrollToGetStarted}
            className="mt-4 inline-block px-6 py-3 bg-gradient-to-r from-sky-400 to-blue-500 text-white rounded-lg hover:from-sky-500 hover:to-blue-600 text-lg font-semibold transition-all opacity-90 hover:opacity-100 block mx-auto md:inline-block font-['Poppins']"
          >
            Start Your Journey
          </button>
        </div>
      </div>

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

      <div
        id="get-started"
        className="animate-fade-in flex flex-col md:flex-row md:items-stretch max-w-lg md:max-w-2xl mx-auto bg-blue-900/30 border border-sky-500/20 rounded-lg shadow-lg shadow-sky-400/10 mt-12 mb-8 relative overflow-hidden"
      >
        <div className="md:w-80 md:min-h-full overflow-hidden rounded-t-lg md:rounded-l-lg md:rounded-t-none">
          {imageError ? (
            <div className="h-60 w-full md:h-full md:w-full bg-gradient-to-br from-blue-900/50 to-sky-500/20 flex items-center justify-center opacity-90 hover:scale-105 transition-transform duration-300">
              <BookOpenIcon className="h-8 w-8 text-sky-400" />
            </div>
          ) : (
            <img
              src="/tomb.png"
              alt="Tomb with stone rolled away for Begin Your Journey"
              className="h-60 w-full md:h-full md:w-full object-cover opacity-90 hover:scale-105 transition-transform duration-300"
              onError={() => setImageError(true)}
            />
          )}
        </div>
        <div className="flex-1 flex flex-col justify-center items-center md:items-start p-6">
          <h2 className="text-2xl font-['Poppins'] font-semibold text-gray-50 mb-1 text-center md:text-left">
            Begin Your Path
          </h2>
          <p className="text-sm font-['Poppins'] text-gray-300 mt-2 mb-6 text-center md:text-left">
            Create an account or log in to dive into Scripture
          </p>
          <div className="flex flex-col gap-4 w-full">
            <button
              type="button"
              aria-label="Sign up with email to start your Bible study journey"
              onClick={() => {
                setIsSignupModalOpen(true);
                setMode("signup");
              }}
              className="relative overflow-hidden bg-gradient-to-r from-sky-400 to-blue-500 text-white rounded-md px-4 py-2 text-lg min-h-[48px] w-full font-['Poppins'] font-semibold shadow hover:from-sky-500 hover:to-blue-600 transition-all focus:outline-none focus:outline-sky-400"
            >
              Sign Up with Email
            </button>
            <button
              type="button"
              aria-label="Sign in to continue your Bible study journey"
              onClick={() => {
                setIsSignupModalOpen(true);
                setMode("signin");
              }}
              className="relative overflow-hidden bg-transparent border border-sky-400 text-sky-400 rounded-md px-4 py-2 text-lg min-h-[48px] w-full font-['Poppins'] font-semibold shadow hover:bg-sky-400/10 transition-all focus:outline-none focus:outline-sky-400"
            >
              Sign In
            </button>
          </div>
        </div>
      </div>

      <footer className="mt-auto border-t border-gray-700 py-4 text-center">
        <p className="text-sm text-gray-400">
          © 2025 Bible Study App | v1.0.14
        </p>
      </footer>

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

      {isSignupModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50">
          <div className="bg-gray-800/90 backdrop-blur-md border-2 border-sky-400/50 rounded-lg p-3 w-full max-w-sm md:max-w-md max-h-[80vh] overflow-y-auto relative shadow-lg">
            <button
              onClick={() => setIsSignupModalOpen(false)}
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-200"
            >
              <svg
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
            <div className="flex flex-col items-center mb-2">
              <svg
                className="h-6 w-6 text-blue-600 mb-1"
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
                />
              </svg>
              <h2 className="text-xl font-bold text-gray-50 mb-4 sm:mb-6 font-['Poppins']">
                Bible Study App
              </h2>
              <p className="text-gray-300 mt-1 text-sm font-['Poppins']">
                {mode === "signup" ? "Create an account" : "Welcome back"}
              </p>
            </div>
            <div className="flex justify-center gap-2 mb-3">
              <button
                onClick={() => setMode("signup")}
                className={`px-2 py-0.5 rounded-lg text-sm font-['Poppins'] ${
                  mode === "signup"
                    ? "bg-gradient-to-r from-sky-400 to-blue-500 text-white"
                    : "bg-gray-700 text-gray-300"
                }`}
              >
                Sign Up
              </button>
              <button
                onClick={() => setMode("signin")}
                className={`px-2 py-0.5 rounded-lg text-sm font-['Poppins'] ${
                  mode === "signin"
                    ? "bg-gradient-to-r from-sky-400 to-blue-500 text-white"
                    : "bg-gray-700 text-gray-300"
                }`}
              >
                Sign In
              </button>
            </div>
            <form onSubmit={handleAuth} className="space-y-2">
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-200 font-['Poppins'] mb-1"
                >
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-200 border border-gray-300 rounded-lg text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-sky-400 text-sm font-['Poppins']"
                  placeholder="Email"
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-200 font-['Poppins'] mb-1"
                >
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-200 border border-gray-300 rounded-lg text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-sky-400 text-sm font-['Poppins']"
                  placeholder="Password"
                  required
                />
              </div>
              {mode === "signup" && (
                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="block text-sm font-medium text-gray-200 font-['Poppins'] mb-1"
                  >
                    Confirm Password
                  </label>
                  <input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-200 border border-gray-300 rounded-lg text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-sky-400 text-sm font-['Poppins']"
                    placeholder="Confirm Password"
                    required
                  />
                </div>
              )}
              {mode === "signin" && (
                <div className="text-right">
                  <a
                    href="#"
                    className="text-sm text-sky-400 hover:underline font-['Poppins']"
                  >
                    Forgot password?
                  </a>
                </div>
              )}
              {error && (
                <p className="text-red-500 text-sm font-['Poppins']">{error}</p>
              )}
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 px-2 py-0.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-['Poppins']"
                  disabled={loading}
                >
                  {loading ? "Loading..." : "Login"}
                </button>
                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  className="flex-1 px-2 py-0.5 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-100 flex items-center justify-center gap-1 text-sm font-['Poppins']"
                >
                  <svg
                    className="h-3 w-3"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      fill="#4285F4"
                    />
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.99.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C4.01 20.48 7.68 23 12 23z"
                      fill="#34A853"
                    />
                    <path
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.68 1 4.01 3.52 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      fill="#EA4335"
                    />
                  </svg>
                  Google
                </button>
              </div>
              <p className="text-center text-sm text-gray-600 font-['Poppins']">
                {mode === "signin"
                  ? "Don't have an account?"
                  : "Already have an account?"}
                <button
                  type="button"
                  onClick={() =>
                    setMode(mode === "signin" ? "signup" : "signin")
                  }
                  className="text-sky-400 hover:underline ml-1 text-sm"
                >
                  {mode === "signin" ? "Sign Up" : "Sign In"}
                </button>
              </p>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
