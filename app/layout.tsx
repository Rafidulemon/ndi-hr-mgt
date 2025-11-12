import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import LeftMenu from "./components/navigations/LeftMenu";
import { ChatLauncher } from "./components/navigations/ChatLauncher";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "NDI HR Management",
  description:
    "A modern workspace to track attendance, manage leave, and stay connected with your team.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased text-slate-900`}
      >
        <div className="relative flex min-h-screen w-full">
          <div className="absolute inset-x-0 top-0 h-40 w-full bg-gradient-to-b from-white/70 to-transparent blur-2xl" />
          <div className="relative z-10 flex w-full flex-col gap-6 px-4 py-6 sm:px-6 lg:flex-row lg:px-10 xl:px-14">
            <aside className="w-full lg:w-72 xl:w-80">
              <div className="sticky top-6">
                <LeftMenu />
              </div>
            </aside>
            <main className="flex-1 pb-16">{children}</main>
          </div>
          <ChatLauncher />
        </div>
      </body>
    </html>
  );
}
