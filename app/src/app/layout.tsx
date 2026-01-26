import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Argo Note - Your AI-Powered Blog. Fully Automated.",
  description: "AI-powered blog automation for vibe coders. Set up your SEO blog in minutes and let AI handle the rest.",
  keywords: ["AI blog", "automated blogging", "SEO", "vibe coding", "content generation"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}
