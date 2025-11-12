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
  );
}
