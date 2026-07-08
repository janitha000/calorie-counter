import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { Navigation } from "@/components/Navigation";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
});

export const metadata = {
  title: "AI Calorie Counter",
  description: "Track your calories with the power of AI",
  themeColor: "#22c55e",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "CalorieAI",
  },
};

export const viewport = {
  themeColor: "#22c55e",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${outfit.variable} h-full antialiased`}
    >
      <body className="h-full flex flex-col font-sans bg-gray-50 text-gray-900 pb-20 md:pb-0">
        <Providers>
          <main className="flex-1 overflow-y-auto max-w-lg mx-auto w-full bg-white md:border-x md:border-gray-100 shadow-sm relative">
             {children}
          </main>
          <Navigation />
        </Providers>
      </body>
    </html>
  );
}
