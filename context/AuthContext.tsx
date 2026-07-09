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
import { supabase } from "@/lib/supabaseClient";

type AuthContextType = {
  session: Session | null;
  user: User | null;
  signOut: () => Promise<void>;
  error: string | null;
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
  const router = useRouter();

  // Initialize state with server-provided values
  const [session, setSession] = useState<Session | null>(initialSession);
  const [user, setUser] = useState<User | null>(initialUser);
  const [error] = useState<string | null>(null);
  const [loading] = useState(false);

  useEffect(() => {
    // Listen for auth state changes to keep client in sync
    // DEADLOCK WARNING: never call supabase.auth.* (or any supabase.*) inside
    // this callback. auth-js awaits these callbacks while holding the
    // cross-tab navigator lock, so a nested auth call waits on that same lock
    // forever — wedging every tab on this origin (observed: second tab's init
    // held the lock permanently and all tabs' auth/DB calls timed out). Use
    // the newSession payload instead; it already carries the user.
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, newSession) => {
        if (event === "SIGNED_IN" && newSession) {
          setUser(newSession.user);
          setSession(newSession);
          // SIGNED_IN also fires when an existing session is recovered on
          // page load, not just on a fresh sign-in — only leave the landing
          // page, never hijack a deep link (e.g. /reflections).
          if (window.location.pathname === "/") {
            router.push("/reading");
          }
        } else if (event === "SIGNED_OUT") {
          setSession(null);
          setUser(null);
          router.push("/");
        } else if (event === "TOKEN_REFRESHED" && newSession) {
          // Handle token refresh by updating the session
          setSession(newSession);
        } else if (event === "USER_UPDATED" && newSession) {
          setUser(newSession.user);
          setSession(newSession);
        }
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [router, initialSession, initialUser]);

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
        signOut,
        error,
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
