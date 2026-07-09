import { ReactNode } from "react";
import ServerLayout from "./layout.server";
import type { Metadata } from "next";

const title = "Bible Study App";
const description =
  "Verse-by-verse Bible study with AI-generated commentary — no account needed.";

export const metadata: Metadata = {
  title,
  description,
  // On Vercel, Next.js resolves relative image URLs against the deployment
  // URL automatically; set NEXT_PUBLIC_SITE_URL to override (e.g. a custom
  // domain).
  metadataBase: process.env.NEXT_PUBLIC_SITE_URL
    ? new URL(process.env.NEXT_PUBLIC_SITE_URL)
    : undefined,
  openGraph: {
    title,
    description,
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Bible Study App — verse-by-verse study with AI-generated commentary",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/og-image.png"],
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return <ServerLayout>{children}</ServerLayout>;
}
