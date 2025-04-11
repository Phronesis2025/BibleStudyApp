import type { Metadata } from "next";
import { Inter, Poppins } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "next-themes";
import VercelAnalytics from "@/components/VercelAnalytics";
import Link from "next/link";

const inter = Inter({ subsets: ["latin"] });
const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-poppins",
});

export const metadata: Metadata = {
  title: "Bible Study App",
  description: "A modern Bible study app with AI-powered commentary",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body
        className={`${inter.className} ${poppins.variable} font-sans antialiased`}
      >
        <ThemeProvider attribute="class" defaultTheme="dark" forcedTheme="dark">
          <nav className="fixed top-0 left-0 right-0 bg-gray-900/95 backdrop-blur-md text-white z-50 shadow-md">
            <div className="max-w-6xl mx-auto px-4 py-3 flex justify-between">
              <Link
                href="/"
                className="text-gray-300 hover:text-sky-400 transition-colors"
              >
                Home
              </Link>
              <div className="flex gap-4">
                <Link
                  href="/reading"
                  className="text-gray-300 hover:text-sky-400 transition-colors"
                >
                  Reading
                </Link>
                <Link
                  href="/metrics"
                  className="text-gray-300 hover:text-sky-400 transition-colors"
                >
                  Metrics
                </Link>
              </div>
            </div>
          </nav>
          <main className="pt-14">{children}</main>
          <VercelAnalytics />
        </ThemeProvider>
      </body>
    </html>
  );
}
