// context/AuthContext.tsx
"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { Session, User } from "@supabase/supabase-js";
import { getSupabaseClient } from "@/lib/supabaseClient";

type AuthContextType = {
  session: Session | null;
  user: User | null;
  signUp: (email: string, password: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
  error: string | null;
  success: string | null;
  loading: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

type AuthProviderProps = {
  children: ReactNode;
  initialSession?: Session | null;
  initialUser?: User | null;
};

export const AuthProvider = ({
  children,
  initialSession = null,
  initialUser = null,
}: AuthProviderProps) => {
  const supabase = getSupabaseClient();
  const router = useRouter();

  // Initialize state with server-provided values
  const [session, setSession] = useState<Session | null>(initialSession);
  const [user, setUser] = useState<User | null>(initialUser);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // No need to check session on client side if provided by server
    if (!initialSession || !initialUser) {
      console.warn(
        "Missing initialSession or initialUser. This may cause authentication issues."
      );
    }

    // Listen for auth state changes to keep client in sync
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        console.log(`Auth state changed: ${event}`);

        if (event === "SIGNED_IN" && newSession) {
          try {
            const { data, error } = await supabase.auth.getUser();
            if (error) throw error;

            if (data.user) {
              setUser(data.user);
              setSession(newSession);
              router.push("/reading");
            }
          } catch (err: any) {
            console.error("Error fetching user after sign in:", err.message);
            setError("Failed to fetch user data.");
          }
        } else if (event === "SIGNED_OUT") {
          setSession(null);
          setUser(null);
          router.push("/");
        } else if (event === "TOKEN_REFRESHED" && newSession) {
          // Handle token refresh by updating the session
          setSession(newSession);
        } else if (event === "USER_UPDATED" && newSession) {
          // Update user data when it changes
          const { data, error } = await supabase.auth.getUser();
          if (!error && data.user) {
            setUser(data.user);
            setSession(newSession);
          }
        }
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [supabase, router, initialSession, initialUser]);

  const signUp = async (email: string, password: string) => {
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      await supabase.auth.signOut();
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (signUpError) {
        if (signUpError.message.includes("User already registered")) {
          throw new Error(
            "This email is already registered. Please sign in instead."
          );
        }
        throw new Error(
          signUpError.message || "Failed to sign up. Please try again."
        );
      }

      if (!data.user) {
        throw new Error("No user created during signup");
      }

      const { data: existingUsers, error: fetchError } = await supabase
        .from("users")
        .select("*")
        .eq("id", data.user.id);

      if (fetchError) throw fetchError;

      if (!existingUsers || existingUsers.length === 0) {
        const defaultName = data.user.email?.split("@")[0] || "Anonymous";
        const { error: insertError } = await supabase.from("users").insert([
          {
            id: data.user.id,
            name: defaultName,
            email: data.user.email || "",
            created_at: new Date().toISOString(),
          },
        ]);

        if (insertError) throw insertError;
      }

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError)
        throw new Error("Failed to sign in after signup. Please try again.");

      setSuccess(
        "Signup successful! Please check your email to verify your account."
      );
    } catch (err: any) {
      setError(err.message || "An error occurred during signup");
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      const { data, error: signInError } =
        await supabase.auth.signInWithPassword({
          email,
          password,
        });

      if (signInError)
        throw new Error("Invalid email or password. Please try again.");
      if (!data.user || !data.session)
        throw new Error("Sign-in successful but no user or session returned");

      setSuccess("Login successful!");
    } catch (err: any) {
      setError(err.message || "An error occurred during sign-in");
    } finally {
      setLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/callback`,
        },
      });

      if (error)
        throw new Error(
          error.message || "Failed to sign in with Google. Please try again."
        );
    } catch (err: any) {
      setError(err.message || "An error occurred during Google authentication");
    } finally {
      setLoading(false);
    }
  };

  const forgotPassword = async (email: string) => {
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/reset-password`,
      });

      if (error)
        throw new Error(
          error.message ||
            "Failed to send password reset email. Please try again."
        );

      setSuccess("Password reset email sent! Please check your inbox.");
    } catch (err: any) {
      setError(
        err.message || "An error occurred while sending the reset email."
      );
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setUser(null);
    router.push("/");
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        user,
        signUp,
        signIn,
        signInWithGoogle,
        forgotPassword,
        signOut,
        error,
        success,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};
