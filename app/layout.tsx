import type { Metadata } from "next";
import "@fontsource/noto-sans-sc/400.css";
import "@fontsource/noto-sans-sc/600.css";
import "./globals.css";
import { AppProviders } from "@/components/app-providers";

export const metadata: Metadata = {
  title: "DAWSEN AI · Product Potential",
  description: "Evidence-led product potential assessment for global vape markets",
  robots: { index: false, follow: false }
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN">
      <body>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
