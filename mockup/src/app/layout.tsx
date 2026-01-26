import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { AppProviders } from "@/components/providers/AppProviders";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Argo Note - Your AI-Powered Blog. Fully Automated.",
  description:
    "Argo Note automatically creates, manages, and grows your WordPress blog with AI. Enter your URL and watch the magic happen.",
  keywords: [
    "AI blog",
    "automated blogging",
    "WordPress automation",
    "AI content generation",
    "SEO automation",
  ],
  authors: [{ name: "Argo Note" }],
  openGraph: {
    title: "Argo Note - Your AI-Powered Blog. Fully Automated.",
    description:
      "Argo Note automatically creates, manages, and grows your WordPress blog with AI.",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Argo Note - Your AI-Powered Blog. Fully Automated.",
    description:
      "Argo Note automatically creates, manages, and grows your WordPress blog with AI.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
