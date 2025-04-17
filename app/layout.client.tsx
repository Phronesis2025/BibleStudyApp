"use client";

import { ReactNode } from "react";
import { AuthProvider } from "@/context/AuthContext";
import type { Session, User } from "@supabase/supabase-js";
import { Inter, Poppins } from "next/font/google";
import "./globals.css";
import VercelAnalytics from "@/components/VercelAnalytics";
import ThemeProviderWrapper from "@/components/ThemeProviderWrapper";

const inter = Inter({ subsets: ["latin"] });
const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-poppins",
});

type ClientLayoutProps = {
  children: ReactNode;
  session: Session | null;
  user: User | null;
};

export default function ClientLayout({
  children,
  session,
  user,
}: ClientLayoutProps) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body
        className={`${inter.className} ${poppins.variable} font-sans antialiased`}
      >
        <ThemeProviderWrapper>
          <AuthProvider initialSession={session} initialUser={user}>
            <main>{children}</main>
          </AuthProvider>
          <VercelAnalytics />
        </ThemeProviderWrapper>
      </body>
    </html>
  );
}
