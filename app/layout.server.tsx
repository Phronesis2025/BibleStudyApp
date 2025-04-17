import { ReactNode } from "react";
import { getServerSupabaseClient } from "@/lib/supabaseServerClient";
import ClientLayout from "./layout.client";

// This is a Server Component
export default async function ServerLayout({
  children,
}: {
  children: ReactNode;
}) {
  // Get the session server-side
  const supabase = getServerSupabaseClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // Get the user if session exists
  const user = session?.user || null;

  // Pass the session and user to the client layout
  return (
    <ClientLayout session={session} user={user}>
      {children}
    </ClientLayout>
  );
}
