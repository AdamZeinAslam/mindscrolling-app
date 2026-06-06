import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { TimerProvider } from "@/context/TimerContext";
import { AuthProvider } from "@/context/AuthContext";
import { Navigation } from "@/components/Navigation";

import { ThemeProvider } from "@/context/ThemeProvider";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Nalar - Educational Shorts",
  description: "Combat doomscrolling with focused educational content.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} antialiased`} suppressHydrationWarning>
      <body className="h-[100dvh] w-full flex flex-col md:flex-row bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50 overflow-hidden transition-colors duration-300">
        <ThemeProvider>
          <AuthProvider>
            <TimerProvider>
              <Navigation />
              <div className="flex-1 h-[100dvh] md:pl-64 overflow-y-auto relative z-0">
                {children}
              </div>
            </TimerProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
