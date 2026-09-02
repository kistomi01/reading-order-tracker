import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Reading Order Tracker",
  description: "Track book series reading order, progress, and EPUB sessions.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full bg-slate-950 text-slate-100 antialiased">{children}</body>
    </html>
  );
}
