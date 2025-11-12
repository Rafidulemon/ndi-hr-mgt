import LeftMenu from "../components/navigations/LeftMenu";
import { ChatLauncher } from "../components/navigations/ChatLauncher";
import "../globals.css";


export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="relative flex min-h-screen w-full">
      <div className="absolute inset-x-0 top-0 h-40 w-full bg-gradient-to-b from-white/70 to-transparent blur-2xl dark:from-slate-900/60" />
      <div className="relative z-10 flex w-full flex-col gap-6 px-4 py-6 transition-colors duration-200 sm:px-6 lg:flex-row lg:px-10 xl:px-14">
        <aside className="w-full flex-shrink-0 lg:w-72 lg:flex-shrink-0 xl:w-80">
          <div className="sticky top-6">
            <LeftMenu className="lg:max-h-[calc(100vh-3rem)] lg:overflow-y-auto lg:overscroll-contain lg:scrollbar-none" />
          </div>
        </aside>
        <main className="flex-1 pb-16 text-slate-800 transition-colors duration-200 dark:text-slate-100">
          {children}
        </main>
      </div>
    </div>
  );
}
