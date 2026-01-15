import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MindWise AI – AI-Powered Mental Health Support",
  description:
    "MindWise AI delivers personalized, judgment-free mental health support for college students and young professionals through AI-powered therapy, mood tracking, and guided sessions.",
  keywords: "mental health, AI therapy, mood tracking, journaling, anxiety, stress, mindfulness",
  openGraph: {
    title: "MindWise AI",
    description: "Your personal AI mental health companion.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
