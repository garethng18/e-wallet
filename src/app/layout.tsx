import type { Metadata, Viewport } from "next";
import { Manrope, Fraunces } from "next/font/google";
import { WalletProvider } from "@/components/wallet-provider";
import "./globals.css";

const body = Manrope({
  subsets: ["latin"],
  variable: "--font-body",
});

const display = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
});

export const metadata: Metadata = {
  title: "E Wallet | 友Point 风格电子钱包",
  description:
    "Android-friendly e-wallet inspired by AIA友Point — earn, redeem, and transfer points backed by Google Sheets.",
  applicationName: "E Wallet",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "E Wallet",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#c8102e",
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-HK">
      <body className={`${body.variable} ${display.variable} antialiased`}>
        <WalletProvider>{children}</WalletProvider>
      </body>
    </html>
  );
}
