import type { Metadata } from "next";
import { Space_Grotesk, JetBrains_Mono, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const jakartaSans = Plus_Jakarta_Sans({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "PhishLens | Forensic URL Threat Intelligence & Explainable AI",
  description: "Tactical cybersecurity platform providing automated heuristic telemetry, RFC protocol validation, and explainable phishing threat intelligence.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${spaceGrotesk.variable} ${jetbrainsMono.variable} ${jakartaSans.variable} dark h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#07090d] text-[#e6edf3] font-sans selection:bg-[#388bfd]/30 selection:text-[#58a6ff]">
        {children}
      </body>
    </html>
  );
}
