'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const isLoginPage = pathname === '/auth/login';
  const isActive = (path: string) => pathname === path;

  return (
    <header className="relative z-10 flex flex-row h-[65px] justify-between items-center py-4 px-10 bg-white mx-20 shadow-2xl rounded-md text-[#1E1E1E]">
      <button
        type="button"
        onClick={() => router.push('/')}
        className="cursor-pointer w-[120px] h-full"
      >
        <Image
          src="/demo_logo.png"
          alt="Logo"
          width={120}
          height={40}
          className="w-full h-full object-contain"
          priority
        />
      </button>

      <nav>
        <ul className="flex flex-row gap-10">
          <li>
            <Link
              href="/support"
              className={`${
                isActive('/support') ? 'text-primary' : 'text-text_bold'
              } hover:text-primary text-text_bold font-semibold`}
            >
              Support
            </Link>
          </li>
          <li>
            <Link
              href="/terms"
              className={`${
                isActive('/terms') ? 'text-primary' : 'text-text_bold'
              } hover:text-primary text-text_bold font-semibold`}
            >
              Terms
            </Link>
          </li>
          <li>
            <Link
              href="/privacy"
              className={`${
                isActive('/privacy') ? 'text-primary' : 'text-text_bold'
              } hover:text-primary text-text_bold font-semibold`}
            >
              Privacy
            </Link>
          </li>
          <li>
            <Link
              href={isLoginPage ? '/auth/signup' : '/auth/login'}
              className="bg-primary px-4 py-2 rounded-md hover:bg-white hover:border hover:border-primary hover:text-primary text-white font-semibold"
            >
              {isLoginPage ? 'Sign Up' : 'Login'}
            </Link>
          </li>
        </ul>
      </nav>
    </header>
  );
}

export default Header;
