import { Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { Navigation } from "@/components/Navigation";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata = {
  title: "MacroForge • Calorie & Macro Counter",
  description: "Mobile-first, high-density calorie, macro & sugar tracker with AI-powered meal logging.",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/icon-192.svg", sizes: "192x192", type: "image/svg+xml" },
    ],
    apple: [
      { url: "/icon-192.svg", sizes: "192x192", type: "image/svg+xml" },
    ],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "CalorieAI",
  },
};

export const viewport = {
  themeColor: "#0e0d0c",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${plusJakarta.variable} ${jetbrainsMono.variable} h-full antialiased dark`}
    >
      <body className="h-full flex flex-col font-sans bg-[#f7f5f0] dark:bg-[#0e0d0c] text-[#1c1917] dark:text-[#ede9e6] transition-colors">
        <Providers>
          <div className="flex-1 max-w-md mx-auto w-full relative">
            {children}
          </div>
          <Navigation />
        </Providers>
      </body>
    </html>
  );
}
