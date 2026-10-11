import type { Metadata } from "next";
import TimelineExperience from "@/components/timeline/TimelineExperience";

export const metadata: Metadata = {
  title: "Adam to Moses · Bible Study App",
  description:
    "An interactive 3D timeline of every life from Adam to Moses: who overlapped whom, the Flood, and three ancient ways of counting the years.",
};

export default function TimelinePage() {
  return <TimelineExperience />;
}
