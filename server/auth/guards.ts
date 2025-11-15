import "server-only";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { SESSION_COOKIE_NAME, findSessionByToken } from "@/server/auth/session";
import type { AuthUser } from "@/server/auth/selection";

export async function getCurrentUserFromCookies(): Promise<AuthUser | null> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE_NAME)?.value;

  if (!token) {
    return null;
  }

  const session = await findSessionByToken(token);
  return session?.user ?? null;
}

export async function requireUser() {
  const user = await getCurrentUserFromCookies();

  if (!user) {
    redirect("/auth/login");
  }

  return user;
}
