import type { Metadata } from "next";
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
        <ThemeProviderWrapper>
          <main>{children}</main>
          <VercelAnalytics />
        </ThemeProviderWrapper>
      </body>
    </html>
  );
}
