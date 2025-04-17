import { ReactNode } from "react";
import ServerLayout from "./layout.server";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Bible Study App",
  description: "Grow closer to God with every verse you read.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return <ServerLayout>{children}</ServerLayout>;
}
