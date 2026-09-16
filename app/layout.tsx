import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ServiceWorkerRegister } from "./sw-register";

export const metadata: Metadata = {
  title: "PrepMe — Interview Voice Coach",
  description: "Talk your way to interview-ready, based on your resume and the job description.",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "PrepMe",
  },
  icons: {
    icon: "/icons/icon-192.png",
    apple: "/icons/icon-180.png",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#1a52ff",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        <ServiceWorkerRegister />
        <div className="mx-auto min-h-screen max-w-md bg-white sm:my-6 sm:rounded-[2rem] sm:border sm:border-slate-200 sm:shadow-xl">
          {children}
        </div>
      </body>
    </html>
  );
}
