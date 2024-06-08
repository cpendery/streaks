import type { Metadata } from "next";
import { Inter as FontSans } from "next/font/google";
import { RecoilRoot } from "recoil";
import { cn } from "@/lib/utils";

import "./globals.css";
import { Roots } from "@/components/roots";

const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "streaks",
  description: "streaks for sophia",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          fontSans.variable
        )}
      >
        <Roots>{children}</Roots>
      </body>
    </html>
  );
}
