import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import "../styles/dictionary/variables.css";
import "../styles/dictionary/longman.css";
import "../styles/dictionary/oxford.css";
import "../styles/dictionary/webster.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "多读书 - duodushu",
  description: "多读书 - 沉浸式英语学习平台，AI 辅助阅读、智能词典查询",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {/* PDF.js URL.parse polyfill - must load before PDF.js */}
        <Script
          src="/pdf-polyfill.js"
          strategy="beforeInteractive"
        />
        {children}
      </body>
    </html>
  );
}
