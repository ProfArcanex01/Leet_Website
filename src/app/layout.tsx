import type { Metadata } from "next";
import { DM_Sans, Playfair_Display } from "next/font/google";
import "./globals.css";

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://leetgh.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Leet — Commute smarter",
    template: "%s | Leet",
  },
  description:
    "Leet connects riders and hosts on reliable routes for safer, cheaper commuting in Ghana.",
  keywords: [
    "carpooling",
    "ride sharing",
    "Ghana",
    "Accra",
    "commute",
    "Leet",
    "shared rides",
  ],
  icons: {
    icon: "/leet_logo.png",
    apple: "/leet_logo.png",
  },
  openGraph: {
    type: "website",
    siteName: "Leet",
    title: "Leet — Commute smarter",
    description:
      "Share your existing route. Ride together. Split the cost. Leet matches riders with hosts already driving the same way.",
    url: siteUrl,
    images: [
      {
        url: "/leet_logo.png",
        width: 512,
        height: 512,
        alt: "Leet — Carpooling in Ghana",
      },
    ],
  },
  twitter: {
    card: "summary",
    title: "Leet — Commute smarter",
    description:
      "Share your existing route. Ride together. Split the cost.",
    images: ["/leet_logo.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${dmSans.variable} ${playfair.variable}`}>
        {children}
      </body>
    </html>
  );
}
